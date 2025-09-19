// services.js - Background services for monitoring and automation
const cron = require('cron');
const { CHAIN_CONFIG } = require("../utils/rcpMap");
const { DepositMonitor } = require('./depositMonitor');
const { BalanceChecker } = require('./balanceChecker');
const { TransactionExecutor } = require('./transactionExecutor');
// Do not import broadcastDeposit here; import only where needed
const { ethers } = require('ethers');
const {
    getPendingTransactions,
    updateTransaction,
    getWallets,
    updateWalletBalance,
    getWallet,
    insertTransaction,
    getAccountWalletAddresses,
    updateWalletAddressBalance
} = require('../models/db');


let providers;
let balanceChecker;
let transactionExecutor;
let depositMonitor;

// Initialize all services
function initializeServices(multiChainProviders) {
    providers = multiChainProviders;

    // Initialize service classes
    balanceChecker = new BalanceChecker(providers);
    transactionExecutor = new TransactionExecutor(providers);
    depositMonitor = new DepositMonitor(providers, balanceChecker);

    // Start all background services
    startTransactionMonitor();
    startMultiChainBalanceSync();
    startMultiChainDepositMonitor();
    startGasMonitor();

    console.log('✓ All multi-chain services initialized');
}

// ========== TRANSACTION MONITORING SERVICE ==========

const transactionMonitorJob = new cron.CronJob('*/30 * * * * *', async () => {
    try {
        const pendingTxs = await getPendingTransactions();

        for (const tx of pendingTxs) {
            if (tx.tx_hash && tx.chain) {
                await checkMultiChainTransactionStatus(tx);
            }
        }
    } catch (error) {
        console.error('Multi-chain transaction monitor error:', error);
    }
});

async function checkMultiChainTransactionStatus(transaction) {
    try {
        const chainConfig = CHAIN_CONFIG[transaction.chain];
        if (!chainConfig) return;

        let isConfirmed = false;
        let status = 'pending';

        switch (chainConfig.chainType) {
            case 'evm':
                const provider = providers.getProvider(transaction.chain);
                const receipt = await provider.getTransactionReceipt(transaction.tx_hash);
                if (receipt) {
                    isConfirmed = true;
                    status = receipt.status === 1 ? 'completed' : 'failed';
                }
                break;

            case 'solana':
                const connection = providers.getProvider('solana');
                const confirmation = await connection.getSignatureStatus(transaction.tx_hash);
                if (confirmation.value?.confirmationStatus === 'finalized') {
                    isConfirmed = true;
                    status = confirmation.value.err ? 'failed' : 'completed';
                }
                break;

            case 'bitcoin':
                // Use BlockCypher to check Bitcoin transaction
                const axios = require('axios');
                try {
                    const response = await axios.get(
                        `https://api.blockcypher.com/v1/btc/main/txs/${transaction.tx_hash}`
                    );
                    if (response.data.confirmations >= 1) {
                        isConfirmed = true;
                        status = 'completed';
                    }
                } catch (error) {
                    // Transaction might not exist yet
                }
                break;
        }

        if (isConfirmed) {
            await updateTransaction(transaction.id, status, transaction.tx_hash);
            console.log(`${transaction.chain.toUpperCase()} transaction ${transaction.tx_hash} updated to ${status}`);
        }

    } catch (error) {
        console.error(`Error checking ${transaction.chain} transaction ${transaction.tx_hash}:`, error);

        // Auto-fail old transactions
        const createdAt = new Date(transaction.created_at);
        const timeoutDuration = getTransactionTimeout(transaction.chain);

        if (Date.now() - createdAt > timeoutDuration) {
            await updateTransaction(transaction.id, 'failed', transaction.tx_hash);
            console.log(`${transaction.chain.toUpperCase()} transaction ${transaction.tx_hash} marked as failed after timeout`);
        }
    }
}

function getTransactionTimeout(chain) {
    // Different timeout periods based on chain characteristics
    switch (chain) {
        case 'bitcoin': return 2 * 60 * 60 * 1000; // 2 hours
        case 'ethereum': return 1 * 60 * 60 * 1000; // 1 hour
        case 'solana': return 5 * 60 * 1000; // 5 minutes
        case 'bsc': return 10 * 60 * 1000; // 10 minutes
        default: return 1 * 60 * 60 * 1000; // 1 hour default
    }
}

function startTransactionMonitor() {
    transactionMonitorJob.start();
    console.log('✓ Multi-chain transaction monitor started');
}

async function pollTransactionStatus(txHash, provider, durationMinutes = 5) {
  let attempts = 0;

  const interval = setInterval(async () => {
    try {
      const receipt = await provider.getTransactionReceipt(txHash);

      if (receipt) {
        console.log(`✓ Transaction ${txHash} confirmed in block ${receipt.blockNumber}`);
        clearInterval(interval);
        return;
      } else {
        console.log(`[${new Date().toISOString()}] Transaction ${txHash} still pending...`);
      }
    } catch (error) {
      console.error(`Error checking transaction ${txHash}:`, error.message);
    }

    attempts++;
    if (attempts >= durationMinutes) {
      clearInterval(interval);
      console.log(`⚠️ Transaction ${txHash} not confirmed after ${durationMinutes} minutes`);
    }
  }, 60 * 1000); // every minute
}


// ========== MULTI-CHAIN BALANCE SYNC ==========
const multiChainBalanceSyncJob = new cron.CronJob('0 */5 * * * *', async () => {
    try {
        await syncAllChainBalances();
    } catch (error) {
        console.error('Multi-chain balance sync error:', error);
    }
});

async function syncAllChainBalances() {
    const supportedChains = Object.keys(CHAIN_CONFIG);

    for (const chain of supportedChains) {
        try {
            await syncChainBalances(chain);
        } catch (error) {
            console.error(`Error syncing ${chain} balances:`, error);
        }
    }
}

async function syncChainBalances(chain) {
    try {
        // Get all addresses for this chain
        const { pool } = require('../models/db');
        const connection = await pool.getConnection();

        try {
            const [addresses] = await connection.execute(`
        SELECT wa.*, hw.account_id 
        FROM wallet_addresses wa 
        JOIN hd_wallets hw ON wa.hd_wallet_id = hw.id 
        WHERE hw.chain = ? AND hw.is_active = 1
        LIMIT 100
      `, [chain]);

            let updatedCount = 0;

            for (const addr of addresses) {
                try {
                    const balance = await balanceChecker.getBalance(addr.address, chain);
                    const storedBalance = parseFloat(addr.balance || 0);

                    if (Math.abs(balance.balance - storedBalance) > 0.0001) {
                        await updateWalletAddressBalance(addr.address, balance.balance);
                        updatedCount++;
                    }
                } catch (error) {
                    console.error(`Error syncing ${addr.address} on ${chain}:`, error);
                }
            }

            if (updatedCount > 0) {
                console.log(`Updated ${updatedCount} ${chain.toUpperCase()} addresses`);
            }

        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(`Error in ${chain} balance sync:`, error);
    }
}

function startMultiChainBalanceSync() {
    multiChainBalanceSyncJob.start();
    console.log('✓ Multi-chain balance sync started');
}

// ========== MULTI-CHAIN DEPOSIT MONITORING ==========
function startMultiChainDepositMonitor() {
    depositMonitor.startAllChainMonitoring();
    console.log('✓ Multi-chain deposit monitor started');
}

async function checkWalletBalanceEveryMinute(address, chain, durationMinutes = 5) {
  const { balanceChecker } = require('./services'); // already initialized
  let count = 0;

  const interval = setInterval(async () => {
    try {
      const result = await balanceChecker.getBalance(address, chain);
      console.log(`[${new Date().toISOString()}] Balance for ${address} on ${chain}: ${result.balance} ${result.symbol}`);
    } catch (error) {
      console.error(`Error checking balance for ${address}:`, error.message);
    }

    count++;
    if (count >= durationMinutes) {
      clearInterval(interval);
      console.log(`✓ Finished checking balance for ${address} every minute for ${durationMinutes} minutes`);
    }
  }, 60 * 1000); // 1 minute
}


// ========== GAS PRICE MONITORING (EVM chains only) ==========
const gasPriceMonitorJob = new cron.CronJob('0 */5 * * * *', async () => {
    try {
        await monitorAllChainGasPrices();
    } catch (error) {
        console.error('Gas price monitor error:', error);
    }
});

let currentGasPrices = {};
let gasHistory = {};

async function monitorAllChainGasPrices() {
    const evmChains = Object.keys(CHAIN_CONFIG).filter(
        chain => CHAIN_CONFIG[chain].chainType === 'evm'
    );

    for (const chain of evmChains) {
        try {
            const provider = providers.getProvider(chain);
            const feeData = await provider.getFeeData();
            const gasPriceGwei = parseFloat(ethers.formatUnits(feeData.gasPrice, 'gwei'));

            const gasInfo = {
                gasPrice: gasPriceGwei,
                maxFeePerGas: feeData.maxFeePerGas ? parseFloat(ethers.formatUnits(feeData.maxFeePerGas, 'gwei')) : null,
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? parseFloat(ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei')) : null,
                timestamp: new Date(),
                chain: chain
            };

            currentGasPrices[chain] = gasInfo;

            // Maintain gas history
            if (!gasHistory[chain]) gasHistory[chain] = [];
            gasHistory[chain].push(gasInfo);

            // Keep last 100 records per chain
            if (gasHistory[chain].length > 100) {
                gasHistory[chain].shift();
            }

        } catch (error) {
            console.error(`Error monitoring ${chain} gas prices:`, error);
        }
    }
}

function getCurrentGasPrices() {
    return currentGasPrices;
}

function getGasHistory(chain = null) {
    return chain ? gasHistory[chain] || [] : gasHistory;
}

function startGasMonitor() {
    gasPriceMonitorJob.start();
    console.log('✓ Multi-chain gas monitor started');
}

// ========== SERVICE HEALTH AND STATUS ==========
function getServicesStatus() {
    const status = {};

    Object.keys(CHAIN_CONFIG).forEach(chain => {
        status[chain] = {
            transactionMonitoring: transactionMonitorJob.running,
            balanceSync: multiChainBalanceSyncJob.running,
            depositMonitoring: depositMonitor?.getMonitoringStatus()[chain]?.monitoring || false,
            gasMonitoring: CHAIN_CONFIG[chain].chainType === 'evm' ? gasPriceMonitorJob.running : 'N/A',
            lastHealthCheck: new Date().toISOString()
        };
    });

    return status;
}

// ========== CLEANUP FUNCTIONS ==========
function stopAllServices() {
    // Stop cron jobs
    if (transactionMonitorJob.running) transactionMonitorJob.stop();
    if (multiChainBalanceSyncJob.running) multiChainBalanceSyncJob.stop();
    if (gasPriceMonitorJob.running) gasPriceMonitorJob.stop();

    // Stop deposit monitoring
    if (depositMonitor) depositMonitor.stopAllMonitoring();

    console.log('✓ All multi-chain services stopped');
}

// ========== UTILITY FUNCTIONS ==========
async function processManualDeposit(accountId, chain, amount, address) {
    try {
        const result = await depositMonitor.processDeposit({
            account_id: accountId,
            address: address
        }, amount, chain, { balance: amount });

        return result;
    } catch (error) {
        console.error('Error processing manual deposit:', error);
        throw error;
    }
}

// ========== EXPORTS ========== 
module.exports = {
    initializeServices,
    stopAllServices,
    getServicesStatus,
    getCurrentGasPrices,
    getGasHistory,
    syncChainBalances,
    processManualDeposit,
    checkMultiChainTransactionStatus,
    checkWalletBalanceEveryMinute,
    pollTransactionStatus,

    // Expose service instances for direct access (lazily)
    get depositMonitor() {
        if (!depositMonitor) throw new Error('Services not initialized: depositMonitor');
        return depositMonitor;
    },
    get balanceChecker() {
        if (!balanceChecker) throw new Error('Services not initialized: balanceChecker');
        return balanceChecker;
    },
    get transactionExecutor() {
        if (!transactionExecutor) throw new Error('Services not initialized: transactionExecutor');
        return transactionExecutor;
    }
};