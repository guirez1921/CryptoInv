// depositMonitor.js - Multi-chain deposit monitoring
const { CHAIN_CONFIG } = require('../utils/rcpMap');
const { BalanceChecker } = require('./balanceChecker');
const { insertTransaction, markAddressAsUsed, updateWalletAddressBalance } = require('../models/db');
const { broadcastDeposit } = require('../broadcast/broadcast');

class DepositMonitor {
  constructor(providers, balanceChecker) {
    this.providers = providers;
    this.balanceChecker = balanceChecker;
    this.monitoringIntervals = new Map();
  }

  // Start monitoring deposits for a specific chain
  startChainMonitoring(chain, intervalMs = 60000) {
    if (this.monitoringIntervals.has(chain)) {
      console.log(`Monitoring already active for ${chain}`);
      return;
    }

    const interval = setInterval(async () => {
      try {
        await this.checkChainDeposits(chain);
      } catch (error) {
        console.error(`Error monitoring ${chain} deposits:`, error);
      }
    }, intervalMs);

    this.monitoringIntervals.set(chain, interval);
    console.log(`✓ Deposit monitoring started for ${chain}`);
  }

  // Stop monitoring for a specific chain
  stopChainMonitoring(chain) {
    const interval = this.monitoringIntervals.get(chain);
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(chain);
      console.log(`Deposit monitoring stopped for ${chain}`);
    }
  }

  // Check deposits for all addresses on a specific chain
  async checkChainDeposits(chain) {
    try {
      // Get all wallet addresses for this chain from database
      const addresses = await this.getAllChainAddresses(chain);
      
      for (const addr of addresses) {
        await this.checkAddressDeposits(addr, chain);
      }
      
    } catch (error) {
      console.error(`Error checking ${chain} deposits:`, error);
    }
  }

  // Check deposits for a specific address
  async checkAddressDeposits(addressRecord, chain) {
    try {
      const currentBalance = await this.balanceChecker.getBalance(addressRecord.address, chain);
      const storedBalance = parseFloat(addressRecord.balance || 0);
      
      // Check if balance increased
      if (currentBalance.balance > storedBalance) {
        const depositAmount = currentBalance.balance - storedBalance;
        
        // Minimum deposit check
        const chainConfig = CHAIN_CONFIG[chain];
        if (depositAmount >= chainConfig.minDeposit) {
          await this.processDeposit(addressRecord, depositAmount, chain, currentBalance);
        }
      }
    } catch (error) {
      console.error(`Error checking address ${addressRecord.address}:`, error);
    }
  }

  // Process confirmed deposit
  async processDeposit(addressRecord, depositAmount, chain, balanceInfo) {
    try {
      // Update address balance in database
      await updateWalletAddressBalance(addressRecord.address, balanceInfo.balance);
      
      // Mark address as used
      await markAddressAsUsed(addressRecord.address);
      
      // Record deposit transaction
      const transactionId = await insertTransaction(
        addressRecord.account_id,
        "deposit", 
        depositAmount,
        null, // No from address for deposits
        addressRecord.address,
        "completed",
        null, // Transaction hash not available for deposits
        chain
      );

      console.log(`✓ Deposit processed: ${depositAmount} ${CHAIN_CONFIG[chain].symbol} to account ${addressRecord.account_id}`);
      
      // Notify Laravel backend
      await this.notifyDeposit(addressRecord.account_id, depositAmount, chain, transactionId);
      
      // For Bitcoin, try to get transaction details
      if (chain === 'bitcoin') {
        await this.enrichBitcoinDeposit(addressRecord, transactionId);
      }
      
    } catch (error) {
      console.error('Error processing deposit:', error);
    }
  }

  // Get all wallet addresses for a chain
  async getAllChainAddresses(chain) {
    const { pool } = require('../models/db');
    const connection = await pool.getConnection();
    
    try {
      const [rows] = await connection.execute(`
        SELECT wa.*, hw.account_id, hw.chain 
        FROM wallet_addresses wa 
        JOIN hd_wallets hw ON wa.hd_wallet_id = hw.id 
        WHERE hw.chain = ? AND hw.is_active = 1
        ORDER BY wa.created_at DESC
      `, [chain]);
      
      return rows;
    } finally {
      connection.release();
    }
  }

  // Enrich Bitcoin deposit with transaction details
  async enrichBitcoinDeposit(addressRecord, transactionId) {
    try {
      const axios = require('axios');
      const response = await axios.get(
        `https://api.blockcypher.com/v1/btc/main/addrs/${addressRecord.address}/full?limit=1`
      );
      
      if (response.data.txs && response.data.txs.length > 0) {
        const latestTx = response.data.txs[0];
        
        // Update transaction with Bitcoin tx hash
        const { updateTransaction } = require('../models/db');
        await updateTransaction(transactionId, "completed", latestTx.hash);
      }
    } catch (error) {
      console.error('Error enriching Bitcoin deposit:', error);
    }
  }

  // Notify Laravel backend of deposit (chain-aware, robust)
  async notifyDeposit(accountId, amount, chain, transactionId) {
    try {
      await broadcastDeposit(accountId, amount, chain, transactionId);
    } catch (error) {
      console.error(`Error notifying deposit for account ${accountId} (${chain}):`, error);
    }
  }

  // Start monitoring all active chains
  startAllChainMonitoring() {
    const supportedChains = Object.keys(CHAIN_CONFIG);
    
    supportedChains.forEach(chain => {
      // Different intervals for different chains based on block time
      let interval = 60000; // 1 minute default
      
      switch (chain) {
        case 'bitcoin':
          interval = 300000; // 5 minutes (slower blocks)
          break;
        case 'ethereum':
          interval = 60000; // 1 minute
          break;
        case 'solana':
          interval = 30000; // 30 seconds (faster)
          break;
        case 'bsc':
          interval = 15000; // 15 seconds (very fast)
          break;
      }
      
      this.startChainMonitoring(chain, interval);
    });
  }

  // Stop all monitoring
  stopAllMonitoring() {
    this.monitoringIntervals.forEach((interval, chain) => {
      clearInterval(interval);
      console.log(`Stopped monitoring for ${chain}`);
    });
    
    this.monitoringIntervals.clear();
    console.log('All deposit monitoring stopped');
  }

  // Get monitoring status
  getMonitoringStatus() {
    const status = {};
    
    Object.keys(CHAIN_CONFIG).forEach(chain => {
      status[chain] = {
        monitoring: this.monitoringIntervals.has(chain),
        lastChecked: new Date().toISOString()
      };
    });
    
    return status;
  }
}

module.exports = { DepositMonitor };