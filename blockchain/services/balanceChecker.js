// balanceChecker.js - Multi-chain balance checking utilities
const { ethers } = require('ethers');
const { Connection, LAMPORTS_PER_SOL, PublicKey } = require('@solana/web3.js');
const axios = require('axios');

const { CHAIN_CONFIG, TOKEN_CONFIG } = require('../utils/rcpMap');
const { MultiChainWalletUtils } = require('../utils/walletUtils');

class BalanceChecker {
  constructor(providers) {
    this.providers = providers;
  }

  // Get balance for any supported chain
  async getBalance(address, chain, tokenAddress = null) {
    const chainConfig = CHAIN_CONFIG[chain];
    if (!chainConfig) {
      throw new Error(`Unsupported chain: ${chain}`);
    }

    switch (chainConfig.chainType) {
      case 'evm':
        return this.getEVMBalance(address, chain, tokenAddress);
      case 'solana':
        return this.getSolanaBalance(address, tokenAddress);
      case 'bitcoin':
        return this.getBitcoinBalance(address);
      default:
        throw new Error(`Unsupported chain type: ${chainConfig.chainType}`);
    }
  }

  // EVM balance checking (ETH, BNB, MATIC, etc.)
  async getEVMBalance(address, chain, tokenAddress = null) {
    const provider = this.providers.getProvider(chain);
    const chainConfig = CHAIN_CONFIG[chain];

    if (tokenAddress) {
      // ERC20/BEP20 token balance
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ['function balanceOf(address owner) view returns (uint256)'],
        provider
      );
      
      const balance = await tokenContract.balanceOf(address);
      const tokenInfo = this.findTokenInfo(chain, tokenAddress);
      const decimals = tokenInfo ? tokenInfo.decimals : 18;
      
      return {
        balance: parseFloat(ethers.formatUnits(balance, decimals)),
        balanceWei: balance.toString(),
        symbol: tokenInfo ? tokenInfo.symbol : 'TOKEN',
        decimals: decimals
      };
    } else {
      // Native token balance
      const balance = await provider.getBalance(address);
      return {
        balance: parseFloat(ethers.formatUnits(balance, chainConfig.decimals)),
        balanceWei: balance.toString(),
        symbol: chainConfig.symbol,
        decimals: chainConfig.decimals
      };
    }
  }

  // Solana balance checking
  async getSolanaBalance(address, tokenMint = null) {
    const connection = this.providers.getProvider('solana');
    try {
      if (tokenMint) {
        // SPL token balance
        const tokenAccounts = await connection.getTokenAccountsByOwner(
          new PublicKey(address),
          { mint: new PublicKey(tokenMint) }
        );
        if (tokenAccounts.value.length === 0) {
          return { balance: 0, symbol: 'SPL', decimals: 9 };
        }
        // Properly parse SPL token account data
        const accountInfo = await connection.getParsedAccountInfo(tokenAccounts.value[0].pubkey);
        const parsed = accountInfo.value?.data?.parsed;
        let amount = 0;
        let decimals = 9;
        if (parsed && parsed.info && parsed.info.tokenAmount) {
          amount = parseFloat(parsed.info.tokenAmount.amount) / Math.pow(10, parsed.info.tokenAmount.decimals);
          decimals = parsed.info.tokenAmount.decimals;
        }
        return { balance: amount, symbol: 'SPL', decimals };
      } else {
        // SOL balance
        const balance = await connection.getBalance(new PublicKey(address));
        return {
          balance: balance / LAMPORTS_PER_SOL,
          balanceLamports: balance,
          symbol: 'SOL',
          decimals: 9
        };
      }
    } catch (error) {
      console.error('Error fetching Solana balance:', error);
      throw error;
    }
  }

  // Bitcoin balance checking
  async getBitcoinBalance(address) {
    try {
      // Using BlockCypher API
      const response = await axios.get(`https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance`);
      const satoshis = response.data.balance;
      
      return {
        balance: satoshis / 100000000, // Convert satoshis to BTC
        balanceSatoshis: satoshis,
        symbol: 'BTC',
        decimals: 8
      };
    } catch (error) {
      console.error('Error fetching Bitcoin balance:', error);
      throw error;
    }
  }

  // Get multiple balances for an HD wallet
  async getHDWalletBalances(hdWalletId, addresses, chain) {
    const results = [];
    
    for (const addr of addresses) {
      try {
        const balance = await this.getBalance(addr.address, chain);
        results.push({
          ...addr,
          ...balance,
          lastChecked: new Date()
        });
      } catch (error) {
        results.push({
          ...addr,
          balance: parseFloat(addr.balance || 0),
          error: error.message,
          lastChecked: new Date()
        });
      }
    }
    
    return results;
  }

  // Find token configuration
  findTokenInfo(chain, contractAddress) {
    return Object.values(TOKEN_CONFIG).find(
      token => token.chain === chain && 
      token.contractAddress?.toLowerCase() === contractAddress.toLowerCase()
    );
  }
}

module.exports = { BalanceChecker };