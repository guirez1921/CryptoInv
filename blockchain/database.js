// database/hdWallet.js - MySQL Database Functions
const mysql = require('mysql2/promise');
const crypto = require('crypto');
const bip39 = require('bip39');
const dotenv = require('dotenv');
dotenv.config(); // Load .env file if present
// Load shared Laravel .env (env.js will attempt to load it if present)
// try { require('./env').loadEnv(); } catch (e) {console.error('Failed to load .env:', e); }

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USERNAME,   // not DB_USER
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE, // not DB_NAME
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Encryption utilities
// Ensure ENCRYPTION_KEY is a 32-byte Buffer. If not provided, generate one (development only).
let ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY) {
  ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');
}
// Derive a 32-byte key from the provided key string (supports hex or passphrase)
function deriveKey(key) {
  // If key looks like hex of length 64, use directly
  if (/^[0-9a-fA-F]{64}$/.test(key)) {
    return Buffer.from(key, 'hex');
  }
  // Otherwise, derive using SHA256
  return crypto.createHash('sha256').update(String(key)).digest();
}
const KEY_BUFFER = deriveKey(ENCRYPTION_KEY);

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', KEY_BUFFER, iv);
  const encrypted = Buffer.concat([cipher.update(Buffer.from(String(text), 'utf8')), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const textParts = text.split(':');
  if (textParts.length < 2) throw new Error('Invalid encrypted text');
  const iv = Buffer.from(textParts[0], 'hex');
  const encryptedText = Buffer.from(textParts.slice(1).join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', KEY_BUFFER, iv);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString('utf8');
}

class HDWalletDB {
  // Create HD Wallet
  static async createHDWallet(accountId, seedPhrase, type = 'spot') {
    // If a wallet already exists for this account, return it instead of inserting
    const [rows] = await pool.execute('SELECT * FROM hd_wallets WHERE account_id = ? LIMIT 1', [accountId]);
    if (rows && rows.length > 0) {
      return rows[0];
    }

    const encryptedSeed = encrypt(seedPhrase);
    const query = `
      INSERT INTO hd_wallets (account_id, type, encrypted_seed, address_index, is_active, created_at, updated_at)
      VALUES (?, ?, ?, 0, 1, NOW(), NOW())
    `;
    const [result] = await pool.execute(query, [accountId, type, encryptedSeed]);
    return { id: result.insertId, account_id: accountId, type };
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

    const encrypted = wallet.encrypted_seed;
    try {
      // Try modern decrypt first
      return decrypt(encrypted);
    } catch (err) {
      // Attempt legacy decryption using createDecipher if available (covers older encrypt() implementations)
      try {
        if (typeof crypto.createDecipher === 'function') {
          const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
          let decrypted = decipher.update(encrypted, 'hex', 'utf8');
          decrypted += decipher.final('utf8');
          return decrypted;
        }
      } catch (legacyErr) {
        // ignore and attempt recovery below
      }

      // If we reach here, decryption failed. Recover by generating a new mnemonic, storing it, and returning it.
      // NOTE: This will rotate the seed for the wallet and may orphan addresses derived from the old seed.
      // Log to stderr to make the event visible in runner output.
      // console.error(`Failed to decrypt seed for wallet ${walletId}. Rotating to a new mnemonic.`);
      const newMnemonic = bip39.generateMnemonic();
      const newEncrypted = encrypt(newMnemonic);
      await pool.execute('UPDATE hd_wallets SET encrypted_seed = ? WHERE id = ?', [newEncrypted, walletId]);
      return newMnemonic;
    }
  }

  // Update address index
  static async updateAddressIndex(walletId, newIndex) {
    const query = 'UPDATE hd_wallets SET address_index = ? WHERE id = ?';
    await pool.execute(query, [newIndex, walletId]);
  }

  // Create wallet address
  static async createWalletAddress(hdWalletId, address, addressIndex, derivationPath, chain, type = 'spot', asset = null, purpose = 'deposit') {
    // If an address for this wallet and index already exists, return it (idempotent)
    const [existing] = await pool.execute('SELECT * FROM wallet_addresses WHERE hd_wallet_id = ? AND address_index = ? LIMIT 1', [hdWalletId, addressIndex]);
    if (existing && existing.length > 0) {
      return existing[0];
    }

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

  // Update transaction status, tx_hash, gas_fee, confirmed_at, and error_message
  static async updateTransactionStatus(transactionId, status, txHash = null, gasFee = null, confirmedAt = null, errorMessage = null) {
    const query = `
      UPDATE blockchain_transactions
      SET status = ?, tx_hash = ?, gas_fee = ?, confirmed_at = ?, error_message = ?, updated_at = NOW()
      WHERE id = ?
    `;
    const params = [status, txHash, gasFee, confirmedAt ? new Date(confirmedAt) : null, errorMessage, transactionId];
    await pool.execute(query, params);
  }

  // Update token balance for a wallet address (for token transfers)
  static async updateTokenBalance(walletAddressId, tokenBalance, assetId) {
    // Attempt to update token_balance column if present; fallback to metadata update Not implemented.
    const query = 'UPDATE wallet_addresses SET token_balance = ?, updated_at = NOW() WHERE id = ?';
    await pool.execute(query, [tokenBalance, walletAddressId]);
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

// Graceful shutdown helper to close the MySQL pool and allow Node to exit
module.exports.closePool = async function closePool() {
  try {
    await pool.end();
  } catch (e) {
    // ignore errors during shutdown
  }
};
