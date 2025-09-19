// routes/serviceController.js
const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const { checkWalletBalanceEveryMinute, pollTransactionStatus } = require('../services/services');
const multiChainProviders = require('../providers/providers');

// ✅ Trigger balance check loop
router.post('/wallet/:chain/:address/check-balance-loop', (req, res) => {
  const { chain, address } = req.params;

  try {
    checkWalletBalanceEveryMinute(address, chain);
    res.json({ success: true, message: `Started balance check loop for ${address} on ${chain}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Trigger transaction polling loop
router.post('/transaction/:chain/:txHash/poll-status-loop', (req, res) => {
  const { chain, txHash } = req.params;

  try {
    const provider = multiChainProviders.getProvider(chain);
    pollTransactionStatus(txHash, provider);
    res.json({ success: true, message: `Started transaction polling loop for ${txHash} on ${chain}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Check gas fee once
router.get('/chains/:chain/gas-fee', async (req, res) => {
  const { chain } = req.params;

  try {
    const provider = multiChainProviders.getProvider(chain);
    const feeData = await provider.getFeeData();

    res.json({
      success: true,
      chain,
      gasPrice: feeData.gasPrice ? parseFloat(ethers.formatUnits(feeData.gasPrice, 'gwei')) : null,
      maxFeePerGas: feeData.maxFeePerGas ? parseFloat(ethers.formatUnits(feeData.maxFeePerGas, 'gwei')) : null,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? parseFloat(ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei')) : null,
      unit: 'gwei'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;