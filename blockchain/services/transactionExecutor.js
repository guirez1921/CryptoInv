// transactionExecutor.js - Multi-chain transaction execution
const { ethers } = require('ethers');
const { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const bitcoin = require('bitcoinjs-lib');
const axios = require('axios');

const { CHAIN_CONFIG } = require('../utils/rcpMap');
const { MultiChainWalletUtils } = require('../utils/walletUtils');

class TransactionExecutor {
  constructor(providers) {
    this.providers = providers;
  }

  // Execute withdrawal for any supported chain
  async executeWithdrawal(mnemonic, chain, fromAddressIndex, toAddress, amount, gasPrice = null) {
    const chainConfig = CHAIN_CONFIG[chain];
    
    switch (chainConfig.chainType) {
      case 'evm':
        return this.executeEVMWithdrawal(mnemonic, chain, fromAddressIndex, toAddress, amount, gasPrice);
      case 'solana':
        return this.executeSolanaWithdrawal(mnemonic, fromAddressIndex, toAddress, amount);
      case 'bitcoin':
        return this.executeBitcoinWithdrawal(mnemonic, fromAddressIndex, toAddress, amount);
      default:
        throw new Error(`Unsupported chain type: ${chainConfig.chainType}`);
    }
  }

  // EVM withdrawal execution
  async executeEVMWithdrawal(mnemonic, chain, fromAddressIndex, toAddress, amount, gasPrice = null) {
    const provider = this.providers.getProvider(chain);
    const chainConfig = CHAIN_CONFIG[chain];
    
    // Get signing wallet
    const signingWallet = MultiChainWalletUtils.getSigningWallet(mnemonic, chain, fromAddressIndex, provider);
    
    // Prepare transaction
    const tx = {
      to: toAddress,
      value: MultiChainWalletUtils.toBaseUnit(amount, chain),
      gasLimit: 21000
    };

    // Set gas price
    if (gasPrice) {
      tx.gasPrice = ethers.parseUnits(gasPrice.toString(), 'gwei');
    } else {
      const feeData = await provider.getFeeData();
      tx.gasPrice = feeData.gasPrice;
    }

    // Execute transaction
    const sentTx = await signingWallet.sendTransaction(tx);
    const receipt = await sentTx.wait();

    return {
      success: receipt.status === 1,
      txHash: sentTx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      effectiveGasPrice: receipt.effectiveGasPrice?.toString(),
      fee: MultiChainWalletUtils.fromBaseUnit(receipt.gasUsed * receipt.effectiveGasPrice, chain)
    };
  }

  // Solana withdrawal execution
  async executeSolanaWithdrawal(mnemonic, fromAddressIndex, toAddress, amount) {
    const connection = this.providers.getProvider('solana');
    const signingWallet = MultiChainWalletUtils.getSigningWallet(mnemonic, 'solana', fromAddressIndex);
    
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: signingWallet.publicKey,
        toPubkey: new PublicKey(toAddress),
        lamports: MultiChainWalletUtils.toBaseUnit(amount, 'solana'),
      })
    );

    // Get recent blockhash (modern method)
    const latestBlockhash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = latestBlockhash.blockhash;
    transaction.feePayer = signingWallet.publicKey;

    // Sign and send
    transaction.sign(signingWallet);
    const signature = await connection.sendRawTransaction(transaction.serialize());

    // Wait for confirmation
    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
    });

    return {
      success: !confirmation.value.err,
      txHash: signature,
      fee: 0.000005 // Approximate SOL fee
    };
  }

  // Bitcoin withdrawal execution  
  async executeBitcoinWithdrawal(mnemonic, fromAddressIndex, toAddress, amount) {
    const signingWallet = MultiChainWalletUtils.getSigningWallet(mnemonic, 'bitcoin', fromAddressIndex);
    const network = bitcoin.networks.bitcoin;
    
    // Get UTXOs for the address
    const utxos = await this.getBitcoinUTXOs(signingWallet.address);
    
    if (utxos.length === 0) {
      throw new Error('No UTXOs available');
    }

    // Calculate total input value
    const totalInput = utxos.reduce((sum, utxo) => sum + utxo.value, 0);
    const amountSatoshis = MultiChainWalletUtils.toBaseUnit(amount, 'bitcoin');
    const feeRate = 20; // sats per byte
    const estimatedSize = 180 + (utxos.length * 148); // Rough estimate
    const fee = feeRate * estimatedSize;
    
    if (totalInput < amountSatoshis + fee) {
      throw new Error('Insufficient funds for transaction and fee');
    }

    // Create transaction
    const psbt = new bitcoin.Psbt({ network });
    
    // Add inputs
    for (const utxo of utxos) {
      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
          script: bitcoin.address.toOutputScript(signingWallet.address, network),
          value: utxo.value,
        },
      });
    }

    // Add outputs
    psbt.addOutput({
      address: toAddress,
      value: amountSatoshis,
    });

    // Add change output if needed
    const change = totalInput - amountSatoshis - fee;
    if (change > 546) { // Dust threshold
      psbt.addOutput({
        address: signingWallet.address,
        value: change,
      });
    }

    // Sign transaction
    let keyPair;
    try {
      keyPair = bitcoin.ECPair.fromWIF(signingWallet.privateKey, network);
    } catch (err) {
      throw new Error('Invalid Bitcoin private key for ECPair');
    }
    psbt.signAllInputs(keyPair);
    psbt.finalizeAllInputs();

    // Broadcast transaction
    const txHex = psbt.extractTransaction().toHex();
    const txid = await this.broadcastBitcoinTransaction(txHex);

    return {
      success: true,
      txHash: txid,
      fee: MultiChainWalletUtils.fromBaseUnit(fee, 'bitcoin')
    };
  }

  // Get Bitcoin UTXOs
  async getBitcoinUTXOs(address) {
    try {
      const response = await axios.get(`https://api.blockcypher.com/v1/btc/main/addrs/${address}?unspentOnly=true`);
      return response.data.txrefs?.map(utxo => ({
        txid: utxo.tx_hash,
        vout: utxo.tx_output_n,
        value: utxo.value
      })) || [];
    } catch (error) {
      console.error('Error fetching Bitcoin UTXOs:', error);
      throw error;
    }
  }

  // Broadcast Bitcoin transaction
  async broadcastBitcoinTransaction(txHex) {
    try {
      const response = await axios.post('https://api.blockcypher.com/v1/btc/main/txs/push', {
        tx: txHex
      });
      return response.data.tx.hash;
    } catch (error) {
      console.error('Error broadcasting Bitcoin transaction:', error);
      throw error;
    }
  }

  // Estimate transaction fee
  async estimateFee(chain, amount, gasPrice = null) {
    const chainConfig = CHAIN_CONFIG[chain];
    
    switch (chainConfig.chainType) {
      case 'evm':
        const provider = this.providers.getProvider(chain);
        const feeData = await provider.getFeeData();
        const gas = gasPrice ? ethers.parseUnits(gasPrice.toString(), 'gwei') : feeData.gasPrice;
        const gasLimit = 21000;
        return MultiChainWalletUtils.fromBaseUnit(gas * BigInt(gasLimit), chain);
        
      case 'solana':
        return 0.000005; // Fixed SOL fee
        
      case 'bitcoin':
        const feeRate = 20; // sats per byte
        const estimatedSize = 250; // Average transaction size
        return MultiChainWalletUtils.fromBaseUnit(feeRate * estimatedSize, chain);
        
      default:
        throw new Error(`Unsupported chain: ${chain}`);
    }
  }
}

module.exports = { TransactionExecutor };