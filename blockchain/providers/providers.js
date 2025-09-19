// providers.js - Extended multi-chain provider management
const { ethers } = require('ethers');
const { Connection, PublicKey, LAMPORTS_PER_SOL, Keypair } = require('@solana/web3.js');
const bitcoin = require('bitcoinjs-lib');
const axios = require('axios');

// Import existing config
const { rpcMap, CHAIN_CONFIG } = require("../utils/rcpMap");

class MultiChainProviders {
  constructor() {
    this.evmProviders = {};
    this.solanaConnection = null;
    this.btcNetwork = bitcoin.networks.bitcoin;
    this.masterWallets = {};
  }

  // Initialize all chain providers
  initializeProviders() {
    // Initialize EVM chains (ETH, BNB, etc.)
    this.initializeEVMProviders();
    
    // Initialize Solana
    this.initializeSolanaProvider();
    
    // Bitcoin doesn't need persistent connection
    console.log('✓ Bitcoin provider initialized');
  }

  initializeEVMProviders() {
    const evmChains = ['ethereum', 'bsc', 'polygon', 'arbitrum', 'optimism', 'base', 'avalanche'];

    evmChains.forEach(chainKey => {
      if (rpcMap[chainKey]) {
        try {
          this.evmProviders[chainKey] = new ethers.JsonRpcProvider(rpcMap[chainKey]); // 20 seconds

          // Master wallet for each chain
          const masterKey = process.env[`MASTER_PRIVATE_KEY_${chainKey.toUpperCase()}`] || process.env.MASTER_PRIVATE_KEY;
          if (masterKey) {
            this.masterWallets[chainKey] = new ethers.Wallet(masterKey, this.evmProviders[chainKey]);
          }

          console.log(`✓ ${CHAIN_CONFIG[chainKey].name} provider initialized`);
        } catch (error) {
          console.error(`✗ Failed to initialize ${chainKey} provider:`, error.message);
        }
      }
    });
  }

  initializeSolanaProvider() {
    try {
      const solanaRpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
      this.solanaConnection = new Connection(solanaRpcUrl, 'confirmed');
      
      // Master wallet for Solana
      const solanaMasterKey = process.env.SOLANA_MASTER_PRIVATE_KEY;
      if (solanaMasterKey) {
        this.masterWallets.solana = Keypair.fromSecretKey(
          new Uint8Array(JSON.parse(solanaMasterKey))
        );
      }
      
      console.log('✓ Solana provider initialized');
    } catch (error) {
      console.error('✗ Failed to initialize Solana provider:', error.message);
    }
  }

  // Get appropriate provider for chain
  getProvider(chain) {
    if (chain === 'solana') {
      return this.solanaConnection;
    } else if (chain === 'bitcoin') {
      return this.btcNetwork;
    } else if (this.evmProviders[chain]) {
      return this.evmProviders[chain];
    }
    throw new Error(`Unsupported chain: ${chain}`);
  }

  // getMasterWallet(chain) {
  //   const masterWallet = this.masterWallets[chain];
  //   if (!masterWallet) {
  //     throw new Error(`Master wallet not configured for chain: ${chain}`);
  //   }
  //   return masterWallet;
  // }

  // Check provider health
  async checkHealth(chain) {
    try {
      if (chain === 'solana') {
        const slot = await this.solanaConnection.getSlot();
        return { healthy: true, blockNumber: slot };
      } else if (chain === 'bitcoin') {
        // Use BlockCypher API for BTC health check
        const response = await axios.get('https://api.blockcypher.com/v1/btc/main');
        return { healthy: true, blockNumber: response.data.height };
      } else if (this.evmProviders[chain]) {
        const blockNumber = await this.evmProviders[chain].getBlockNumber();
        return { healthy: true, blockNumber };
      }
    } catch (error) {
      return { healthy: false, error: error.message };
    }
  }
}

module.exports = { MultiChainProviders };