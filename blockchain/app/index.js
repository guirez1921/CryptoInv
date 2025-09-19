const express = require("express");
const dotenv = require("dotenv");
const { ethers } = require("ethers");
const crypto = require("crypto");
const cors = require("cors");

// Import RPC mappings
const { rpcMap, CHAIN_CONFIG } = require("../utils/rcpMap");
const { MultiChainProviders } = require('../providers/providers');
const { MultiChainWalletUtils } = require('../utils/walletUtils');
const { BalanceChecker } = require('../services/balanceChecker');
const { TransactionExecutor } = require('../services/transactionExecutor');
const { DepositMonitor } = require('../services/depositMonitor');
const { PublicKey } = require('@solana/web3.js');
const serviceRoutes = require('../controllers/serviceController');
const bip32 = require('bip32');

// Import transaction executor from services
// const { transactionExecutor } = require('./services');

// Import database functions
const {
  // HD Wallet functions
  insertHDWallet,
  getHDWallet,
  getHDWallets,
  updateHDWalletAddressIndex,
  insertWalletAddress,
  getWalletAddress,
  getWalletAddressByAddress,
  getAllWalletAddresses,
  getAccountWalletAddresses,
  updateWalletAddressBalance,
  markAddressAsUsed,
  getUnusedAddress,

  // Legacy functions for backward compatibility
  insertWallet,
  updateWalletBalance,
  updateAccountBalance,
  getWallets,
  getWallet,
  getWalletByAddress,
  insertTransaction,
  updateTransaction,
  getTransaction,
  getAccountBalance,
  lockWallet,
  unlockWallet,
  testConnection
} = require("../models/db.js");

// Import middleware
const {
  authenticateAPI,
  helmet,
  generalLimiter,
  strictLimiter,
  validateAccountId,
  validateWithdrawal,
  validateTransactionId,
  validateWalletType,
  requestLogger,
  asyncHandler,
  errorHandler
} = require("../middleware/middleware.js");

// Import background services
const { initializeServices, getServicesStatus } = require("../services/services.js");

dotenv.config({ path: "../.env" });

const app = express();

// ========== MIDDLEWARE SETUP ==========
app.use(helmet);
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Apply rate limiting to all routes
app.use(generalLimiter);

// API authentication middleware
app.use('/api', authenticateAPI);
app.use('/api', serviceRoutes);

// ========== MULTI-CHAIN PROVIDER MANAGEMENT ==========

// Replace your provider initialization section with:
const multiChainProviders = new MultiChainProviders();
let balanceChecker;

function initializeChainProviders() {
  multiChainProviders.initializeProviders();
  balanceChecker = new BalanceChecker(multiChainProviders);
  console.log('✓ Multi-chain providers initialized');
}

// Get provider for specific chain
// function getProvider(chain) {
//   const provider = providers[chain];
//   if (!provider) {
//     throw new Error(`Unsupported chain: ${chain}`);
//   }
//   return provider;
// }

function getProvider(chain) {
  return multiChainProviders.getProvider(chain);
}

// Get master wallet for specific chain
// function getMasterWallet(chain) {
//   const masterWallet = masterWallets[chain];
//   if (!masterWallet) {
//     throw new Error(`Master wallet not configured for chain: ${chain}`);
//   }
//   return masterWallet;
// }

// Encryption for seeds and private keys
const ENCRYPTION_KEY_BASE64 = process.env.APP_KEY?.startsWith('base64:')
  ? process.env.APP_KEY.slice(7)
  : process.env.APP_KEY;

if (!ENCRYPTION_KEY_BASE64) {
  throw new Error('APP_KEY is required for encryption');
}

const ENCRYPTION_KEY = Buffer.from(ENCRYPTION_KEY_BASE64, 'base64');
const IV_LENGTH = 16;

function encryptSensitiveData(data) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  // Store IV with encrypted data
  return iv.toString('base64') + ':' + encrypted;
}

function decryptSensitiveData(encryptedData) {
  const [ivBase64, encrypted] = encryptedData.split(':');
  const iv = Buffer.from(ivBase64, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// ========== HD WALLET UTILITIES ==========

// Replace your deriveAddress function with:
function deriveAddress(mnemonic, chain, addressIndex) {
  return MultiChainWalletUtils.deriveAddress(mnemonic, chain, addressIndex);
}

// Replace your createHDWallet function with:
function createHDWallet(mnemonic = null) {
  return MultiChainWalletUtils.createHDWallet(mnemonic);
}

// Get wallet instance for signing transactions
function getWalletForSigning(mnemonic, chain, addressIndex, provider) {
  const coinType = CHAIN_CONFIG[chain]?.coinType || 60;
  const derivationPath = `m/44'/${coinType}'/0'/0/${addressIndex}`;

  const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic);
  const derivedWallet = hdNode.derivePath(derivationPath);

  return new ethers.Wallet(derivedWallet.privateKey, provider);
}

// ========== HD WALLET MANAGEMENT ==========

// Create new HD wallet
app.post("/api/hd-wallet/new/:accountId",
  strictLimiter,
  validateAccountId,
  validateWalletType,
  asyncHandler(async (req, res) => {
    const accountId = req.params.accountId;
    const { type = "spot", chain = "ethereum" } = req.body;

    // Check if HD wallet already exists for this account and chain
    const existingWallet = await getHDWallet(accountId, chain);
    if (existingWallet) {
      return res.status(400).json({
        success: false,
        error: `HD wallet already exists for this account on ${chain}`
      });
    }

    // Create HD wallet
    const hdWallet = createHDWallet();
    const encryptedSeed = encryptSensitiveData(hdWallet.mnemonic);

    // Insert HD wallet record
    const hdWalletId = await insertHDWallet(accountId, type, encryptedSeed, chain);

    // Generate first address (index 0)
    const firstAddress = deriveAddress(hdWallet.mnemonic, chain, 0);
    await insertWalletAddress(
      hdWalletId,
      firstAddress.address,
      0,
      firstAddress.derivationPath,
      'deposit'
    );

    res.json({
      success: true,
      hdWallet: {
        id: hdWalletId,
        mnemonic: hdWallet.mnemonic, // Only return this once for backup
        firstAddress: firstAddress.address,
        chain: chain,
        type: type,
        derivationPath: firstAddress.derivationPath
      }
    });
  })
);

// Get HD wallet info
app.get("/api/hd-wallet/:accountId/:chain",
  validateAccountId,
  asyncHandler(async (req, res) => {
    const accountId = req.params.accountId;
    const chain = req.params.chain.toLowerCase();

    if (!CHAIN_CONFIG[chain]) {
      return res.status(400).json({
        success: false,
        error: `Unsupported chain: ${chain}`
      });
    }

    const hdWallet = await getHDWallet(accountId, chain);
    if (!hdWallet) {
      return res.status(404).json({
        success: false,
        error: "HD wallet not found"
      });
    }

    // Get all addresses for this HD wallet
    const addresses = await getAllWalletAddresses(hdWallet.id);
    const provider = getProvider(chain);
    const chainConfig = CHAIN_CONFIG[chain];

    // Get balances for all addresses, validating each address first
    const addressesWithBalances = await Promise.all(
      addresses.map(async (addr) => {
        if (!MultiChainWalletUtils.validateAddress(addr.address, chain)) {
          return {
            ...addr,
            balance: parseFloat(addr.balance),
            error: `Invalid ${chain} address format`
          };
        }
        try {
          let balance;
          if (chain === 'solana') {
            balance = await provider.getBalance(new PublicKey(addr.address));
          } else {
            balance = await provider.getBalance(addr.address);
          }
          const balanceFormatted = parseFloat(ethers.formatUnits(balance, chainConfig.decimals));

          // Update balance in database if different
          if (Math.abs(balanceFormatted - parseFloat(addr.balance)) > 0.0001) {
            await updateWalletAddressBalance(addr.address, balanceFormatted);
          }

          return {
            ...addr,
            balance: balanceFormatted,
            balanceWei: balance.toString()
          };
        } catch (error) {
          console.error(`Error getting balance for ${addr.address}:`, error);
          return {
            ...addr,
            balance: parseFloat(addr.balance),
            error: "Could not fetch balance"
          };
        }
      })
    );

    const totalBalance = addressesWithBalances.reduce((sum, addr) => sum + addr.balance, 0);

    res.json({
      success: true,
      hdWallet: {
        id: hdWallet.id,
        chain: hdWallet.chain,
        type: hdWallet.type,
        addressIndex: hdWallet.address_index,
        totalBalance: totalBalance,
        addresses: addressesWithBalances,
        chainConfig: chainConfig
      }
    });
  })
);

// Generate new address for HD wallet
app.post("/api/hd-wallet/:accountId/:chain/new-address",
  strictLimiter,
  validateAccountId,
  asyncHandler(async (req, res) => {
    const accountId = req.params.accountId;
    const chain = req.params.chain.toLowerCase();
    const { purpose = 'deposit' } = req.body;

    if (!CHAIN_CONFIG[chain]) {
      return res.status(400).json({
        success: false,
        error: `Unsupported chain: ${chain}`
      });
    }

    const hdWallet = await getHDWallet(accountId, chain);
    if (!hdWallet) {
      return res.status(404).json({
        success: false,
        error: "HD wallet not found. Create HD wallet first."
      });
    }

    // Get next address index
    const nextIndex = hdWallet.address_index + 1;

    // Decrypt seed to generate new address
    const decryptedSeed = decryptSensitiveData(hdWallet.encrypted_seed);
    const newAddress = deriveAddress(decryptedSeed, chain, nextIndex);

    // Insert new address
    await insertWalletAddress(
      hdWallet.id,
      newAddress.address,
      nextIndex,
      newAddress.derivationPath,
      purpose
    );

    // Update HD wallet's address index
    await updateHDWalletAddressIndex(hdWallet.id, nextIndex);

    res.json({
      success: true,
      address: {
        address: newAddress.address,
        addressIndex: nextIndex,
        derivationPath: newAddress.derivationPath,
        purpose: purpose,
        chain: chain
      }
    });
  })
);

// Get unused address for deposits
app.get("/api/hd-wallet/:accountId/:chain/deposit-address",
  validateAccountId,
  asyncHandler(async (req, res) => {
    const accountId = req.params.accountId;
    const chain = req.params.chain.toLowerCase();

    if (!CHAIN_CONFIG[chain]) {
      return res.status(400).json({
        success: false,
        error: `Unsupported chain: ${chain}`
      });
    }

    const hdWallet = await getHDWallet(accountId, chain);
    if (!hdWallet) {
      return res.status(404).json({
        success: false,
        error: "HD wallet not found. Create HD wallet first."
      });
    }

    // Try to get an unused address first
    let unusedAddress = await getUnusedAddress(hdWallet.id);

    if (!unusedAddress) {
      // Generate a new address
      const nextIndex = hdWallet.address_index + 1;
      const decryptedSeed = decryptSensitiveData(hdWallet.encrypted_seed);
      const newAddress = deriveAddress(decryptedSeed, chain, nextIndex);

      // Insert new address
      const addressId = await insertWalletAddress(
        hdWallet.id,
        newAddress.address,
        nextIndex,
        newAddress.derivationPath,
        'deposit'
      );

      // Update HD wallet's address index
      await updateHDWalletAddressIndex(hdWallet.id, nextIndex);

      unusedAddress = {
        id: addressId,
        address: newAddress.address,
        address_index: nextIndex,
        derivation_path: newAddress.derivationPath,
        purpose: 'deposit'
      };
    }

    const chainConfig = CHAIN_CONFIG[chain];

    res.json({
      success: true,
      depositAddress: unusedAddress.address,
      addressIndex: unusedAddress.address_index,
      derivationPath: unusedAddress.derivation_path,
      chain: chain,
      chainConfig: chainConfig,
      message: `Send ${chainConfig.symbol} to this address to deposit funds`
    });
  })
);

// ========== HD WALLET DEPOSIT FUNCTIONALITY ==========

// Check for incoming deposits on HD wallet addresses
app.post("/api/hd-wallet/:accountId/:chain/check-deposits",
  validateAccountId,
  asyncHandler(async (req, res) => {
    const accountId = req.params.accountId;
    const chain = req.params.chain.toLowerCase();

    if (!CHAIN_CONFIG[chain]) {
      return res.status(400).json({
        success: false,
        error: `Unsupported chain: ${chain}`
      });
    }

    const hdWallet = await getHDWallet(accountId, chain);
    if (!hdWallet) {
      return res.status(404).json({
        success: false,
        error: "HD wallet not found"
      });
    }

    const provider = getProvider(chain);
    const chainConfig = CHAIN_CONFIG[chain];
    const addresses = await getAllWalletAddresses(hdWallet.id);

    const deposits = [];
    let totalNewDeposits = 0;

    for (const addr of addresses) {
      try {
        const currentBalance = await provider.getBalance(addr.address);
        const currentBalanceFormatted = parseFloat(ethers.formatUnits(currentBalance, chainConfig.decimals));
        const storedBalance = parseFloat(addr.balance);

        if (currentBalanceFormatted > storedBalance) {
          const depositAmount = currentBalanceFormatted - storedBalance;

          // Update address balance
          await updateWalletAddressBalance(addr.address, currentBalanceFormatted);

          // Mark address as used
          await markAddressAsUsed(addr.address);

          // Record deposit transaction
          await insertTransaction(
            accountId,
            "deposit",
            depositAmount,
            null,
            addr.address,
            "completed",
            null,
            chain
          );

          deposits.push({
            address: addr.address,
            amount: depositAmount,
            newBalance: currentBalanceFormatted,
            previousBalance: storedBalance,
            addressIndex: addr.address_index
          });

          totalNewDeposits += depositAmount;
        }
      } catch (error) {
        console.error(`Error checking deposits for ${addr.address}:`, error);
      }
    }

    if (deposits.length > 0) {
      res.json({
        success: true,
        deposits: deposits,
        totalNewDeposits: totalNewDeposits,
        symbol: chainConfig.symbol,
        chain: chain
      });
    } else {
      res.json({
        success: true,
        deposits: [],
        message: "No new deposits found",
        symbol: chainConfig.symbol,
        chain: chain
      });
    }
  })
);

// ========== SYSTEM OPERATIONS ==========

// Get supported chains
app.get("/api/chains/supported",
  asyncHandler(async (req, res) => {
    const supportedChains = Object.keys(CHAIN_CONFIG).map(key => ({
      key,
      ...CHAIN_CONFIG[key],
      rpcUrl: rpcMap[key] ? 'configured' : 'not configured'
    }));

    res.json({
      success: true,
      chains: supportedChains
    });
  })
);

// Sync all HD wallets for an account
app.post("/api/hd-wallet/:accountId/sync",
  validateAccountId,
  asyncHandler(async (req, res) => {
    const accountId = req.params.accountId;
    const hdWallets = await getHDWallets(accountId);

    const chainTotals = {};
    const syncResults = [];

    for (let hdWallet of hdWallets) {
      try {
        const provider = getProvider(hdWallet.chain);
        const chainConfig = CHAIN_CONFIG[hdWallet.chain];
        const addresses = await getAllWalletAddresses(hdWallet.id);

        let walletTotal = 0;
        const addressResults = [];

        for (let addr of addresses) {
          try {
            const balance = await provider.getBalance(addr.address);
            const balanceFormatted = parseFloat(ethers.formatUnits(balance, chainConfig.decimals));

            await updateWalletAddressBalance(addr.address, balanceFormatted);
            walletTotal += balanceFormatted;

            addressResults.push({
              address: addr.address,
              balance: balanceFormatted,
              addressIndex: addr.address_index
            });
          } catch (error) {
            console.error(`Error syncing address ${addr.address}:`, error);
            addressResults.push({
              address: addr.address,
              balance: parseFloat(addr.balance),
              error: error.message
            });
          }
        }

        if (!chainTotals[hdWallet.chain]) {
          chainTotals[hdWallet.chain] = 0;
        }
        chainTotals[hdWallet.chain] += walletTotal;

        syncResults.push({
          chain: hdWallet.chain,
          walletTotal: walletTotal,
          addresses: addressResults,
          symbol: chainConfig.symbol
        });

      } catch (error) {
        console.error(`Error syncing HD wallet on ${hdWallet.chain}:`, error);
        syncResults.push({
          chain: hdWallet.chain,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      chainTotals: chainTotals,
      wallets: syncResults
    });
  })
);

// Add new endpoint for multi-chain wallet creation
app.post("/api/hd-wallet/multi-chain/:accountId",
  strictLimiter,
  validateAccountId,
  asyncHandler(async (req, res) => {
    const accountId = req.params.accountId;
    const { chains = ['ethereum', 'bitcoin', 'solana', 'bsc'], type = "spot" } = req.body;

    const results = [];
    const errors = [];

    // Create single mnemonic for all chains
    const hdWallet = MultiChainWalletUtils.createHDWallet();
    const encryptedSeed = encryptSensitiveData(hdWallet.mnemonic);

    for (const chain of chains) {
      try {
        // Check if chain is supported
        if (!CHAIN_CONFIG[chain]) {
          errors.push({ chain, error: 'Unsupported chain' });
          continue;
        }

        // Check if HD wallet already exists for this chain
        const existingWallet = await getHDWallet(accountId, chain);
        if (existingWallet) {
          errors.push({ chain, error: 'HD wallet already exists' });
          continue;
        }

        // Insert HD wallet record
        const hdWalletId = await insertHDWallet(accountId, type, encryptedSeed, chain);

        // Generate first address
        const firstAddress = MultiChainWalletUtils.deriveAddress(hdWallet.mnemonic, chain, 0);
        await insertWalletAddress(
          hdWalletId,
          firstAddress.address,
          0,
          firstAddress.derivationPath,
          'deposit'
        );

        results.push({
          chain,
          hdWalletId,
          address: firstAddress.address,
          derivationPath: firstAddress.derivationPath
        });

      } catch (error) {
        errors.push({ chain, error: error.message });
      }
    }

    res.json({
      success: true,
      mnemonic: hdWallet.mnemonic, // Return once for backup
      results,
      errors: errors.length > 0 ? errors : undefined
    });
  })
);

// Enhanced balance checking endpoint
app.get("/api/hd-wallet/:accountId/:chain/balance",
  validateAccountId,
  asyncHandler(async (req, res) => {
    const accountId = req.params.accountId;
    const chain = req.params.chain.toLowerCase();

    if (!CHAIN_CONFIG[chain]) {
      return res.status(400).json({
        success: false,
        error: `Unsupported chain: ${chain}`
      });
    }

    const hdWallet = await getHDWallet(accountId, chain);
    if (!hdWallet) {
      return res.status(404).json({
        success: false,
        error: "HD wallet not found"
      });
    }

    const addresses = await getAllWalletAddresses(hdWallet.id);
    // Validate all addresses before checking balances
    const validAddresses = addresses.filter(addr => MultiChainWalletUtils.validateAddress(addr.address, chain));
    const addressesWithBalances = await balanceChecker.getHDWalletBalances(
      hdWallet.id,
      validAddresses,
      chain
    );

    // Update database with fresh balances
    for (const addr of addressesWithBalances) {
      if (addr.balance !== undefined && !addr.error) {
        await updateWalletAddressBalance(addr.address, addr.balance);
      }
    }

    const totalBalance = addressesWithBalances
      .filter(addr => !addr.error)
      .reduce((sum, addr) => sum + addr.balance, 0);

    res.json({
      success: true,
      hdWallet: {
        id: hdWallet.id,
        chain: hdWallet.chain,
        totalBalance,
        addresses: addressesWithBalances,
        chainConfig: CHAIN_CONFIG[chain]
      }
    });
  })
);

// Multi-chain withdrawal endpoint
app.post("/api/hd-wallet/:accountId/:chain/withdraw",
  strictLimiter,
  validateAccountId,
  validateWithdrawal,
  asyncHandler(async (req, res) => {
    const accountId = req.params.accountId;
    const chain = req.params.chain.toLowerCase();
    const { amount, toAddress } = req.body;

    if (!CHAIN_CONFIG[chain]) {
      return res.status(400).json({
        success: false,
        error: `Unsupported chain: ${chain}`
      });
    }

    // Validate destination address format
    if (!MultiChainWalletUtils.validateAddress(toAddress, chain)) {
      return res.status(400).json({
        success: false,
        error: `Invalid ${chain} address format`
      });
    }

    const hdWallet = await getHDWallet(accountId, chain);
    if (!hdWallet) {
      return res.status(404).json({
        success: false,
        error: "HD wallet not found"
      });
    }

    // Get total balance and select addresses to withdraw from
    const addresses = await getAllWalletAddresses(hdWallet.id);
    // Validate all addresses before checking balances
    const validAddresses = addresses.filter(addr => MultiChainWalletUtils.validateAddress(addr.address, chain));
    const addressesWithBalances = await balanceChecker.getHDWalletBalances(hdWallet.id, validAddresses, chain);

    const totalBalance = addressesWithBalances
      .filter(addr => !addr.error)
      .reduce((sum, addr) => sum + addr.balance, 0);

    // Estimate transaction fee
    const estimatedFee = await service.transactionExecutor.estimateFee(chain, amount);
    const withdrawAmount = parseFloat(amount);

    if (withdrawAmount + estimatedFee > totalBalance) {
      return res.status(400).json({
        success: false,
        error: `Insufficient balance. Available: ${totalBalance} ${CHAIN_CONFIG[chain].symbol}, Required: ${withdrawAmount + estimatedFee} ${CHAIN_CONFIG[chain].symbol}`
      });
    }

    // Create pending transaction record
    const transactionId = await insertTransaction(
      accountId,
      "withdrawal",
      withdrawAmount,
      "pending_selection", // Will update with actual from addresses
      toAddress,
      "pending",
      null,
      chain
    );

    res.json({
      success: true,
      transaction: {
        id: transactionId,
        amount: withdrawAmount,
        toAddress: toAddress,
        estimatedFee: estimatedFee,
        availableBalance: totalBalance,
        status: "pending",
        chain: chain,
        symbol: CHAIN_CONFIG[chain].symbol
      }
    });
  })
);

// Execute multi-chain withdrawal
app.post("/api/hd-wallet/withdraw/:transactionId/execute",
  strictLimiter,
  validateTransactionId,
  asyncHandler(async (req, res) => {
    const transactionId = req.params.transactionId;
    const transaction = await getTransaction(transactionId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: "Transaction not found"
      });
    }

    if (transaction.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: "Transaction already processed"
      });
    }

    const chain = transaction.chain || 'ethereum';
    const hdWallet = await getHDWallet(transaction.account_id, chain);

    if (!hdWallet) {
      return res.status(404).json({
        success: false,
        error: "HD wallet not found"
      });
    }

    // Update to processing
    await updateTransaction(transactionId, "processing");

    try {
      const decryptedSeed = decryptSensitiveData(hdWallet.encrypted_seed);

      // Find address with sufficient balance
      const addresses = await getAllWalletAddresses(hdWallet.id);
      // Validate all addresses before checking balances
      const validAddresses = addresses.filter(addr => MultiChainWalletUtils.validateAddress(addr.address, chain));
      const addressesWithBalances = await balanceChecker.getHDWalletBalances(hdWallet.id, validAddresses, chain);

      // Sort by balance (highest first)
      const sortedAddresses = addressesWithBalances
        .filter(addr => !addr.error && addr.balance > 0)
        .sort((a, b) => b.balance - a.balance);

      const withdrawAmount = parseFloat(transaction.amount);
      let selectedAddress = null;

      // Simple selection: use the address with highest balance that can cover the withdrawal
      for (const addr of sortedAddresses) {
        const estimatedFee = await services.transactionExecutor.estimateFee(chain, withdrawAmount);
        if (addr.balance >= withdrawAmount + estimatedFee) {
          selectedAddress = addr;
          break;
        }
      }

      if (!selectedAddress) {
        await updateTransaction(transactionId, "failed");
        return res.status(400).json({
          success: false,
          error: "No single address has sufficient balance for withdrawal"
        });
      }

      // Execute the withdrawal
      const result = await service.transactionExecutor.executeWithdrawal(
        decryptedSeed,
        chain,
        selectedAddress.address_index,
        transaction.to_address,
        withdrawAmount
      );

      if (result.success) {
        await updateTransaction(transactionId, "completed", result.txHash);

        // Update address balance
        const newBalance = await balanceChecker.getBalance(selectedAddress.address, chain);
        await updateWalletAddressBalance(selectedAddress.address, newBalance.balance);

        res.json({
          success: true,
          transaction: {
            id: transactionId,
            status: "completed",
            txHash: result.txHash,
            blockNumber: result.blockNumber,
            gasUsed: result.gasUsed,
            actualFee: result.fee,
            fromAddress: selectedAddress.address,
            chain: chain
          }
        });
      } else {
        await updateTransaction(transactionId, "failed");
        res.status(400).json({
          success: false,
          error: "Transaction execution failed"
        });
      }

    } catch (error) {
      console.error(`${chain} withdrawal error:`, error);
      await updateTransaction(transactionId, "failed");

      res.status(400).json({
        success: false,
        error: error.message || "Withdrawal failed"
      });
    }
  })
);

// Get gas prices for EVM chains
app.get("/api/chains/:chain/gas-price",
  asyncHandler(async (req, res) => {
    const chain = req.params.chain.toLowerCase();
    const chainConfig = CHAIN_CONFIG[chain];

    if (!chainConfig || chainConfig.chainType !== 'evm') {
      return res.status(400).json({
        success: false,
        error: "Chain not supported or not EVM-compatible"
      });
    }

    try {
      const { getCurrentGasPrices } = require('../services/services');
      const currentPrices = getCurrentGasPrices();

      if (!currentPrices[chain]) {
        // Fetch current gas price
        const provider = multiChainProviders.getProvider(chain);
        const feeData = await provider.getFeeData();

        return res.json({
          success: true,
          gasPrice: parseFloat(ethers.formatUnits(feeData.gasPrice, 'gwei')),
          maxFeePerGas: feeData.maxFeePerGas ? parseFloat(ethers.formatUnits(feeData.maxFeePerGas, 'gwei')) : null,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? parseFloat(ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei')) : null,
          unit: 'gwei',
          chain: chain
        });
      }

      res.json({
        success: true,
        ...currentPrices[chain],
        unit: 'gwei'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to fetch gas price"
      });
    }
  })
);

// Estimate transaction fee
app.post("/api/chains/:chain/estimate-fee",
  asyncHandler(async (req, res) => {
    const chain = req.params.chain.toLowerCase();
    const { amount, gasPrice } = req.body;

    if (!CHAIN_CONFIG[chain]) {
      return res.status(400).json({
        success: false,
        error: `Unsupported chain: ${chain}`
      });
    }

    try {
      const estimatedFee = await service.transactionExecutor.estimateFee(chain, amount, gasPrice);

      res.json({
        success: true,
        estimatedFee: estimatedFee,
        symbol: CHAIN_CONFIG[chain].symbol,
        chain: chain
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to estimate fee"
      });
    }
  })
);

// Manual deposit processing (admin endpoint)
app.post("/api/admin/deposits/process",
  strictLimiter,
  authenticateAPI,
  asyncHandler(async (req, res) => {
    const { accountId, chain, amount, address } = req.body;

    if (!accountId || !chain || !amount || !address) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters"
      });
    }

    try {
      const { processManualDeposit } = require('../services/services');
      const { PublicKey } = require('@solana/web3.js');
      await processManualDeposit(accountId, chain, amount, address);

      res.json({
        success: true,
        message: "Deposit processed successfully"
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  })
);

// Get comprehensive account portfolio across all chains
app.get("/api/portfolio/:accountId",
  validateAccountId,
  asyncHandler(async (req, res) => {
    const accountId = req.params.accountId;

    try {
      const portfolio = {};
      let totalValueUSD = 0;

      // Get HD wallets for all chains
      const hdWallets = await getHDWallets(accountId);

      for (const hdWallet of hdWallets) {
        const addresses = await getAllWalletAddresses(hdWallet.id);
        // Validate all addresses before checking balances
        const validAddresses = addresses.filter(addr => MultiChainWalletUtils.validateAddress(addr.address, hdWallet.chain));
        const addressesWithBalances = await balanceChecker.getHDWalletBalances(
          hdWallet.id,
          validAddresses,
          hdWallet.chain
        );

        const chainTotal = addressesWithBalances
          .filter(addr => !addr.error)
          .reduce((sum, addr) => sum + addr.balance, 0);

        portfolio[hdWallet.chain] = {
          balance: chainTotal,
          symbol: CHAIN_CONFIG[hdWallet.chain].symbol,
          addressCount: addresses.length,
          addresses: addressesWithBalances.map(addr => ({
            address: addr.address,
            balance: addr.balance,
            addressIndex: addr.address_index,
            isUsed: addr.is_used
          }))
        };
      }

      res.json({
        success: true,
        accountId: accountId,
        portfolio: portfolio,
        supportedChains: Object.keys(CHAIN_CONFIG),
        lastUpdated: new Date().toISOString()
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  })
);

// Service status endpoint
app.get("/api/services/status",
  asyncHandler(async (req, res) => {

    res.json({
      success: true,
      services: getServicesStatus(),
      timestamp: new Date().toISOString()
    });
  })
);

// ========== APPLICATION STARTUP ==========

// Update health check to support all chains
app.get("/health",
  asyncHandler(async (req, res) => {
    const healthChecks = [];
    const supportedChains = Object.keys(CHAIN_CONFIG);

    for (const chain of supportedChains) {
      try {
        const health = await multiChainProviders.checkHealth(chain);
        healthChecks.push({ chain, ...health });
      } catch (error) {
        healthChecks.push({
          chain,
          healthy: false,
          error: error.message
        });
      }
    }

    const allHealthy = healthChecks.every(check => check.healthy);

    res.json({
      success: allHealthy,
      status: allHealthy ? "healthy" : "degraded",
      chains: healthChecks,
      timestamp: new Date().toISOString()
    });
  })
);

// Update your startApplication function to use new providers
async function startApplication() {
  try {
    const dbHealthy = await testConnection();
    if (!dbHealthy) {
      throw new Error('Database connection failed');
    }
    console.log('✓ Database connection established');

    // Initialize multi-chain providers
    initializeChainProviders();

    // Test at least one chain connection
    const testResults = await Promise.allSettled([
      multiChainProviders.checkHealth('ethereum'),
      multiChainProviders.checkHealth('bitcoin'),
      multiChainProviders.checkHealth('solana')
    ]);

    const healthyConnections = testResults.filter(result =>
      result.status === 'fulfilled' && result.value.healthy
    ).length;

    console.log(`✓ ${healthyConnections}/3 blockchain connections tested successfully`);

    // Initialize background services - update this call in services.js
    // initializeServices(multiChainProviders);

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`✓ Multi-Chain HD Wallet API running on port ${PORT}`);
      console.log(`✓ Supporting ${Object.keys(CHAIN_CONFIG).length} blockchain networks`);
      console.log(`✓ Chains: ${Object.keys(CHAIN_CONFIG).join(', ')}`);
      console.log('✓ All systems operational');
    });

  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

// Error handling middleware (must be last)
app.use(errorHandler);

// Start the application
startApplication();