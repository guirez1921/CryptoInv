// db.js
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config({ path: "../.env" });

// Create MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

// Generic query executor
async function query(sql, params = []) {
    const [rows] = await pool.execute(sql, params);
    return rows;
}

// Insert new wallet
async function insertWallet(accountId, type, address, chain, privateKey) {
    await query(
        `INSERT INTO wallets 
      (account_id, type, address, chain, balance, private_key, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [accountId, type, address, chain, 0, privateKey]
    );
}

// Update wallet balance
async function updateWalletBalance(address, balance) {
    await query(
        "UPDATE wallets SET balance = ?, updated_at = NOW() WHERE address = ?",
        [balance, address]
    );
}

// Update account balances
async function updateAccountBalance(accountId, total) {
    await query(
        `UPDATE accounts 
     SET total_balance = ?, available_balance = ?, last_activity_at = NOW() 
     WHERE id = ?`,
        [total, total, accountId]
    );
}

// Get wallets for account
async function getWallets(accountId) {
    return await query("SELECT address FROM wallets WHERE account_id = ?", [
        accountId,
    ]);
}

module.exports = {
    insertWallet,
    updateWalletBalance,
    updateAccountBalance,
    getWallets,
};
