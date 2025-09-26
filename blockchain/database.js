// database/hdWallet.js - MySQL Database Functions
const mysql = require('mysql2/promise');
const crypto = require('crypto');

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Encryption utilities
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
  const textParts = text.split(':');
  const encryptedText = textParts.slice(1).join(':');
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

class HDWalletDB {
  // Create HD Wallet
  static async createHDWallet(accountId, seedPhrase, chain = 'ethereum', type = 'spot') {
    const encryptedSeed = encrypt(seedPhrase);
    const query = `
      INSERT INTO hd_wallets (account_id, type, encrypted_seed, chain, address_index, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, 0, 1, NOW(), NOW())
    `;
    const [result] = await pool.execute(query, [accountId, type, encryptedSeed, chain]);
    return { id: result.insertId, account_id: accountId, chain, type };
  }

  // Get HD Wallet
  static async getHDWallet(walletId) {
    const query = 'SELECT * FROM hd_wallets WHERE id = ?';
    const [rows] = await pool.execute(query, [walletId]);
    return rows[0];
  }

  // Get decrypted seed
  static async getDecryptedSeed(walletId) {
    const wallet = await this.getHDWallet(walletId);
    if (!wallet) throw new Error('Wallet not found');
    return decrypt(wallet.encrypted_seed);
  }

  // Update address index
  static async updateAddressIndex(walletId, newIndex) {
    const query = 'UPDATE hd_wallets SET address_index = ? WHERE id = ?';
    await pool.execute(query, [newIndex, walletId]);
  }

  // Create wallet address
  static async createWalletAddress(hdWalletId, address, addressIndex, derivationPath, chain, type = 'spot', asset = null, purpose = 'deposit') {
    const query = `
      INSERT INTO wallet_addresses (hd_wallet_id, address, address_index, derivation_path, chain, type, asset, purpose, balance, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())
    `;
    const [result] = await pool.execute(query, [hdWalletId, address, addressIndex, derivationPath, chain, type, asset, purpose]);
    return { id: result.insertId, address, address_index: addressIndex };
  }

  // Get wallet address by string
  static async getWalletAddressByString(address) {
    const query = 'SELECT * FROM wallet_addresses WHERE address = ?';
    const [rows] = await pool.execute(query, [address]);
    return rows[0];
  }

  // Get all addresses for HD wallet
  static async getWalletAddresses(hdWalletId) {
    const query = 'SELECT * FROM wallet_addresses WHERE hd_wallet_id = ? ORDER BY address_index';
    const [rows] = await pool.execute(query, [hdWalletId]);
    return rows;
  }

  // Update wallet balance
  static async updateWalletBalance(addressId, balance) {
    const query = 'UPDATE wallet_addresses SET balance = ?, last_sync_at = NOW() WHERE id = ?';
    await pool.execute(query, [balance, addressId]);
  }

  // Create blockchain transaction
  static async createBlockchainTransaction(data) {
    const query = `
      INSERT INTO blockchain_transactions (account_id, hd_wallet_id, wallet_address_id, chain, type, from_address, to_address, amount, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())
    `;
    const values = [
      data.accountId, data.hdWalletId, data.walletAddressId, data.chain,
      data.type, data.fromAddress, data.toAddress, data.amount
    ];
    const [result] = await pool.execute(query, values);
    return { id: result.insertId, ...data };
  }

  static async getHDWalletsWithBalances(accountId, chain, { activeOnly = true, type = null } = {}) {
    let query = `
      SELECT hw.*,
             COUNT(wa.id) as address_count,
             SUM(CAST(wa.balance AS DECIMAL(20,8))) as total_balance
      FROM hd_wallets hw
      LEFT JOIN wallet_addresses wa ON hw.id = wa.hd_wallet_id
      WHERE hw.account_id = ? AND hw.chain = ?
    `;

    const params = [accountId, chain];

    if (activeOnly) {
      query += ' AND hw.is_active = 1';
    }

    if (type) {
      query += ' AND hw.type = ?';
      params.push(type);
    }

    query += ' GROUP BY hw.id';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // Get addresses for a wallet
  static async getAddressesForWallet(hdWalletId, { includeEmpty = true } = {}) {
    let query = `
      SELECT * FROM wallet_addresses
      WHERE hd_wallet_id = ?
    `;
    const params = [hdWalletId];

    if (!includeEmpty) {
      query += ' AND balance > 0';
    }

    query += ' ORDER BY address_index';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // Get address summary across all chains
  static async getAddressSummaryAllChains(accountId) {
    const query = `
      SELECT
        hw.chain,
        hw.type,
        COUNT(DISTINCT hw.id) as wallet_count,
        COUNT(wa.id) as address_count,
        SUM(CAST(wa.balance AS DECIMAL(20,8))) as total_balance,
        COUNT(CASE WHEN wa.balance > 0 THEN 1 END) as active_addresses
      FROM hd_wallets hw
      LEFT JOIN wallet_addresses wa ON hw.id = wa.hd_wallet_id
      WHERE hw.account_id = ? AND hw.is_active = 1
      GROUP BY hw.chain, hw.type
      ORDER BY hw.chain, hw.type
    `;

    const [rows] = await pool.execute(query, [accountId]);
    return rows;
  }
}

module.exports = HDWalletDB;
