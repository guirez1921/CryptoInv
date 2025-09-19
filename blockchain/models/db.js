// db.js - Enhanced HD wallet database functions
const mysql = require('mysql2/promise');
const dotenv = require("dotenv");

dotenv.config({ path: "../.env" });

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'crypto_inv',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// ========== HD WALLET OPERATIONS ==========

async function insertHDWallet(accountId, type, encryptedSeed, chain) {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      `INSERT INTO hd_wallets (account_id, type, encrypted_seed, chain, address_index, created_at, updated_at) 
       VALUES (?, ?, ?, ?, 0, NOW(), NOW())`,
      [accountId, type, encryptedSeed, chain]
    );
    return result.insertId;
  } finally {
    connection.release();
  }
}

async function getHDWallet(accountId, chain = null) {
  const connection = await pool.getConnection();
  try {
    let query, params;
    if (chain) {
      query = 'SELECT * FROM hd_wallets WHERE account_id = ? AND chain = ?';
      params = [accountId, chain];
    } else {
      query = 'SELECT * FROM hd_wallets WHERE account_id = ? LIMIT 1';
      params = [accountId];
    }
    
    const [rows] = await connection.execute(query, params);
    return rows[0] || null;
  } finally {
    connection.release();
  }
}

async function getHDWallets(accountId) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT * FROM hd_wallets WHERE account_id = ?',
      [accountId]
    );
    return rows;
  } finally {
    connection.release();
  }
}

async function updateHDWalletAddressIndex(hdWalletId, newIndex) {
  const connection = await pool.getConnection();
  try {
    await connection.execute(
      'UPDATE hd_wallets SET address_index = ?, updated_at = NOW() WHERE id = ?',
      [newIndex, hdWalletId]
    );
  } finally {
    connection.release();
  }
}

// ========== WALLET ADDRESS OPERATIONS ==========

async function insertWalletAddress(hdWalletId, address, addressIndex, derivationPath, purpose = 'deposit') {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      `INSERT INTO wallet_addresses (hd_wallet_id, address, address_index, derivation_path, purpose, balance, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, 0, NOW(), NOW())`,
      [hdWalletId, address, addressIndex, derivationPath, purpose]
    );
    return result.insertId;
  } finally {
    connection.release();
  }
}

async function getWalletAddress(hdWalletId, addressIndex) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT * FROM wallet_addresses WHERE hd_wallet_id = ? AND address_index = ?',
      [hdWalletId, addressIndex]
    );
    return rows[0] || null;
  } finally {
    connection.release();
  }
}

async function getWalletAddressByAddress(address) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT wa.*, hw.account_id, hw.chain FROM wallet_addresses wa JOIN hd_wallets hw ON wa.hd_wallet_id = hw.id WHERE wa.address = ?',
      [address]
    );
    return rows[0] || null;
  } finally {
    connection.release();
  }
}

async function getAllWalletAddresses(hdWalletId) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT * FROM wallet_addresses WHERE hd_wallet_id = ? ORDER BY address_index ASC',
      [hdWalletId]
    );
    return rows;
  } finally {
    connection.release();
  }
}

async function getAccountWalletAddresses(accountId, chain = null) {
  const connection = await pool.getConnection();
  try {
    let query = `SELECT wa.*, hw.chain FROM wallet_addresses wa 
                 JOIN hd_wallets hw ON wa.hd_wallet_id = hw.id 
                 WHERE hw.account_id = ?`;
    let params = [accountId];
    
    if (chain) {
      query += ' AND hw.chain = ?';
      params.push(chain);
    }
    
    query += ' ORDER BY hw.chain, wa.address_index ASC';
    
    const [rows] = await connection.execute(query, params);
    return rows;
  } finally {
    connection.release();
  }
}

async function updateWalletAddressBalance(address, balance) {
  const connection = await pool.getConnection();
  try {
    await connection.execute(
      'UPDATE wallet_addresses SET balance = ?, updated_at = NOW() WHERE address = ?',
      [balance, address]
    );
  } finally {
    connection.release();
  }
}

async function markAddressAsUsed(address) {
  const connection = await pool.getConnection();
  try {
    await connection.execute(
      'UPDATE wallet_addresses SET is_used = 1, used_at = NOW(), updated_at = NOW() WHERE address = ?',
      [address]
    );
  } finally {
    connection.release();
  }
}

async function getUnusedAddress(hdWalletId) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT * FROM wallet_addresses WHERE hd_wallet_id = ? AND is_used = 0 ORDER BY address_index ASC LIMIT 1',
      [hdWalletId]
    );
    return rows[0] || null;
  } finally {
    connection.release();
  }
}


// ========== ACCOUNT OPERATIONS ==========

async function updateAccountBalance(accountId, totalBalance) {
  const connection = await pool.getConnection();
  try {
    await connection.execute(
      'UPDATE accounts SET crypto_balance = ?, updated_at = NOW() WHERE id = ?',
      [totalBalance, accountId]
    );
  } finally {
    connection.release();
  }
}

async function getAccountBalance(accountId) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT crypto_balance FROM accounts WHERE id = ?',
      [accountId]
    );
    return rows[0]?.crypto_balance || 0;
  } finally {
    connection.release();
  }
}

// ========== TRANSACTION OPERATIONS ==========

async function getEthAssetId() {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      "SELECT id FROM assets WHERE symbol = 'ETH' LIMIT 1"
    );
    return rows[0]?.id || 1;
  } finally {
    connection.release();
  }
}

async function insertDeposit(userId, amount, depositAddress, txHash = null, status = 'pending') {
  const connection = await pool.getConnection();
  try {
    const assetId = await getEthAssetId();
    const [result] = await connection.execute(
      `INSERT INTO deposits 
       (user_id, asset_id, deposit_address, amount, status, transaction_hash, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [userId, assetId, depositAddress, amount, status, txHash]
    );
    return result.insertId;
  } finally {
    connection.release();
  }
}

async function insertWithdrawal(userId, amount, withdrawalAddress, networkFee, platformFee = 0) {
  const connection = await pool.getConnection();
  try {
    const assetId = await getEthAssetId();
    const finalAmount = parseFloat(amount) - parseFloat(networkFee) - parseFloat(platformFee);
    
    const [result] = await connection.execute(
      `INSERT INTO withdrawals 
       (user_id, asset_id, withdrawal_address, amount, network_fee, platform_fee, final_amount, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())`,
      [userId, assetId, withdrawalAddress, amount, networkFee, platformFee, finalAmount]
    );
    return result.insertId;
  } finally {
    connection.release();
  }
}

async function insertBlockchainTransaction(assetId, userId, txHash, fromAddress, toAddress, amount, fee = null, status = 'pending', chain = 'ethereum') {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      `INSERT INTO blockchain_transactions 
       (asset_id, account_id, tx_hash, from_address, to_address, amount, gas_fee, status, type, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'deposit', NOW(), NOW())`,
      [assetId, userId, txHash, fromAddress, toAddress, amount, fee, status]
    );
    return result.insertId;
  } finally {
    connection.release();
  }
}

async function insertTransaction(accountId, type, amount, fromAddress, toAddress, status, txHash, chain = 'ethereum') {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      `INSERT INTO blockchain_transactions 
       (account_id, type, amount, from_address, to_address, status, tx_hash, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [accountId, type, amount, fromAddress, toAddress, status, txHash]
    );
    return result.insertId;
  } finally {
    connection.release();
  }
}

async function updateTransaction(transactionId, status, txHash = null) {
  const connection = await pool.getConnection();
  try {
    if (txHash) {
      await connection.execute(
        'UPDATE blockchain_transactions SET status = ?, tx_hash = ?, updated_at = NOW() WHERE id = ?',
        [status, txHash, transactionId]
      );
    } else {
      await connection.execute(
        'UPDATE blockchain_transactions SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, transactionId]
      );
    }
  } finally {
    connection.release();
  }
}

async function getTransaction(transactionId) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT * FROM blockchain_transactions WHERE id = ?',
      [transactionId]
    );
    return rows[0] || null;
  } finally {
    connection.release();
  }
}

async function getTransactions(accountId, limit = 50, offset = 0) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT * FROM blockchain_transactions 
       WHERE account_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [accountId, limit, offset]
    );
    return rows;
  } finally {
    connection.release();
  }
}

async function getPendingTransactions() {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      "SELECT * FROM blockchain_transactions WHERE status = 'pending' ORDER BY created_at ASC"
    );
    return rows;
  } finally {
    connection.release();
  }
}

// ========== UTILITY FUNCTIONS ==========

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.execute('SELECT 1');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// ========== EXPORT FUNCTIONS ==========

module.exports = {
  // HD Wallet functions
  insertHDWallet,
  getHDWallet,
  getHDWallets,
  updateHDWalletAddressIndex,

  // Wallet Address functions
  insertWalletAddress,
  getWalletAddress,
  getWalletAddressByAddress,
  getAllWalletAddresses,
  getAccountWalletAddresses,
  updateWalletAddressBalance,
  markAddressAsUsed,
  getUnusedAddress,

  // Account functions
  updateAccountBalance,
  getAccountBalance,

  // Transaction functions
  insertTransaction,
  updateTransaction,
  getTransaction,
  getTransactions,
  getPendingTransactions,
  insertDeposit,
  insertWithdrawal,
  insertBlockchainTransaction,

  // Utility functions
  testConnection,
  pool
};