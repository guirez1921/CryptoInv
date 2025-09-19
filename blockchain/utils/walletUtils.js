// walletUtils.js - Multi-chain wallet generation utilities
const { ethers } = require('ethers');
const { Keypair, PublicKey } = require('@solana/web3.js');
const { derivePath } = require('ed25519-hd-key');
const bitcoin = require('bitcoinjs-lib');
// const bip32 = require('bip32');
const ecc = require('tiny-secp256k1');
const { BIP32Factory } = require('bip32');
const bip32 = BIP32Factory(ecc); // ✅ correct usage
const bip39 = require('bip39');

const { CHAIN_CONFIG } = require('./rcpMap');

class MultiChainWalletUtils {

  // Generate HD wallet from mnemonic or create new one
  static createHDWallet(mnemonic = null) {
    const mnemonicPhrase = mnemonic || bip39.generateMnemonic(256); // 24 words for better security

    if (!bip39.validateMnemonic(mnemonicPhrase)) {
      throw new Error('Invalid mnemonic phrase');
    }

    return {
      mnemonic: mnemonicPhrase,
      seed: bip39.mnemonicToSeedSync(mnemonicPhrase)
    };
  }

  // Derive address for specific chain and index
  static deriveAddress(mnemonic, chain, addressIndex) {
    const chainConfig = CHAIN_CONFIG[chain];
    if (!chainConfig) {
      throw new Error(`Unsupported chain: ${chain}`);
    }

    switch (chainConfig.chainType) {
      case 'evm':
        return this.deriveEVMAddress(mnemonic, chainConfig, addressIndex);
      case 'solana':
        return this.deriveSolanaAddress(mnemonic, chainConfig, addressIndex);
      case 'bitcoin':
        return this.deriveBitcoinAddress(mnemonic, chainConfig, addressIndex);
      default:
        throw new Error(`Unsupported chain type: ${chainConfig.chainType}`);
    }
  }

  // EVM address derivation (ETH, BNB, MATIC, etc.)

  static deriveEVMAddress(mnemonic, chainConfig, addressIndex) {
    const derivationPath = `${chainConfig.derivationPath}${addressIndex}`;
    // const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic); // ✅ Safe
    // const wallet = hdNode.deriveChild(addressIndex);
    const wallet = ethers.Wallet.fromPhrase(mnemonic, derivationPath);
    
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      derivationPath,
      chainType: 'evm'
    };
  }

  // Solana address derivation
  static deriveSolanaAddress(mnemonic, chainConfig, addressIndex) {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const derivationPath = `${chainConfig.derivationPath}/${addressIndex}'`;

    const derivedSeed = derivePath(derivationPath, seed.toString('hex')).key;
    const keypair = Keypair.fromSeed(derivedSeed.slice(0, 32));

    return {
      address: keypair.publicKey.toBase58(),
      privateKey: Array.from(keypair.secretKey), // Store as array for JSON serialization
      derivationPath: derivationPath,
      chainType: 'solana',
      publicKey: keypair.publicKey.toBase58()
    };
  }

  // Bitcoin address derivation
  static deriveBitcoinAddress(mnemonic, chainConfig, addressIndex) {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const network = chainConfig.network === 'testnet'
      ? bitcoin.networks.testnet
      : bitcoin.networks.bitcoin;
    // Use testnet for testing
    const root = bip32.fromSeed(seed, network);

    const derivationPath = `${chainConfig.derivationPath}${addressIndex}`;
    const child = root.derivePath(derivationPath);

    // Ensure pubkey is a Buffer (bitcoinjs-lib expects Buffer, not Uint8Array)
    const pubkeyBuffer = Buffer.isBuffer(child.publicKey)
      ? child.publicKey
      : Buffer.from(child.publicKey);

    // Generate P2WPKH (native segwit) address
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: pubkeyBuffer,
      network: network,
    });

    return {
      address: address,
      privateKey: child.toWIF(),
      publicKey: pubkeyBuffer.toString('hex'),
      derivationPath: derivationPath,
      chainType: 'bitcoin'
    };
  }

  // Get signing wallet for transactions
  static getSigningWallet(mnemonic, chain, addressIndex, provider = null) {
    const chainConfig = CHAIN_CONFIG[chain];

    switch (chainConfig.chainType) {
      case 'evm':
        const evmWallet = this.deriveEVMAddress(mnemonic, chainConfig, addressIndex);
        return new ethers.Wallet(evmWallet.privateKey, provider);

      case 'solana':
        const solanaWallet = this.deriveSolanaAddress(mnemonic, chainConfig, addressIndex);
        return Keypair.fromSecretKey(new Uint8Array(solanaWallet.privateKey));

      case 'bitcoin':
        const btcWallet = this.deriveBitcoinAddress(mnemonic, chainConfig, addressIndex);
        return {
          privateKey: btcWallet.privateKey,
          address: btcWallet.address,
          publicKey: btcWallet.publicKey
        };

      default:
        throw new Error(`Unsupported chain type: ${chainConfig.chainType}`);
    }
  }

  // Validate address format for chain
  static validateAddress(address, chain) {
    const chainConfig = CHAIN_CONFIG[chain];

    switch (chainConfig.chainType) {
      case 'evm':
        return /^0x[a-fA-F0-9]{40}$/.test(address);
      case 'solana':
        try {
          new PublicKey(address);
          return true;
        } catch {
          return false;
        }
      case 'bitcoin':
        try {
          bitcoin.address.toOutputScript(address, bitcoin.networks.bitcoin);
          return true;
        } catch {
          return false;
        }
      default:
        return false;
    }
  }

  // Convert amount to smallest unit
  static toBaseUnit(amount, chain) {
    const chainConfig = CHAIN_CONFIG[chain];
    const decimals = chainConfig.decimals;

    if (chainConfig.chainType === 'evm') {
      return ethers.parseUnits(amount.toString(), decimals);
    } else if (chain === 'solana') {
      return Math.floor(parseFloat(amount) * Math.pow(10, decimals));
    } else if (chain === 'bitcoin') {
      return Math.floor(parseFloat(amount) * Math.pow(10, decimals)); // satoshis
    }
  }

  // Convert from smallest unit to readable format
  static fromBaseUnit(amount, chain) {
    const chainConfig = CHAIN_CONFIG[chain];
    const decimals = chainConfig.decimals;

    if (chainConfig.chainType === 'evm') {
      return parseFloat(ethers.formatUnits(amount, decimals));
    } else {
      return parseFloat(amount) / Math.pow(10, decimals);
    }
  }
}

module.exports = { MultiChainWalletUtils };