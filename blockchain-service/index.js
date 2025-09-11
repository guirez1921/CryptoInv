// index.js
const express = require("express");
const dotenv = require("dotenv");
const { ethers } = require("ethers");
const {
  insertWallet,
  updateWalletBalance,
  updateAccountBalance,
  getWallets,
} = require("./db.js");

dotenv.config({ path: "../.env" });

const app = express();
app.use(express.json());

// Blockchain provider
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// Create new wallet
app.post("/wallet/new/:accountId", async (req, res) => {
  try {
    const accountId = req.params.accountId;

    const wallet = ethers.Wallet.createRandom();

    await insertWallet(accountId, "spot", wallet.address, "ethereum", wallet.privateKey);

    res.json({
      success: true,
      wallet: {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic?.phrase,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get wallet balance
app.get("/wallet/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const balance = await provider.getBalance(address);
    res.json({
      success: true,
      balance: ethers.formatEther(balance),
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Sync account balances
app.post("/account/:accountId/sync", async (req, res) => {
  try {
    const accountId = req.params.accountId;
    const wallets = await getWallets(accountId);

    let total = 0;
    for (let w of wallets) {
      const balance = await provider.getBalance(w.address);
      const balanceEth = ethers.formatEther(balance);
      await updateWalletBalance(w.address, balanceEth);
      total += parseFloat(balanceEth);
    }

    await updateAccountBalance(accountId, total);

    res.json({ success: true, totalBalance: total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start server
app.listen(4000, () => console.log("Blockchain service running on port 4000"));
