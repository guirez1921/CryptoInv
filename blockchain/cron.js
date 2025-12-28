// Load shared Laravel .env
// try { require('./env').loadEnv(); } catch (e) {}

// balanceCron.js
const cron = require("node-cron");
const WalletService = require("./service");
const { broadcast } = require("./broadcast");
const dotenv = require('dotenv');
dotenv.config(); // Load .env file if present

async function startBalanceCron(address, chain) {
  let runCount = 0;

  const task = cron.schedule("* * * * *", async () => {
    runCount++;

    try {
      const balance = await WalletService.checkBalance(address, chain);
      const balanceFloat = parseFloat(balance);

      // Broadcast balance update
      await broadcast("balances", "balance-update", {
        address,
        chain,
        balance,
        run: runCount,
      });

      console.log(`Run ${runCount}: ${chain} balance for ${address} = ${balance}`);

      // Check if we have a pending deposit for this address that we can confirm
      if (balanceFloat > 0) {
        // Need to import HDWalletDB to check pending deposits
        // Since WalletService imports it, we can expose it or require it here.
        // It's not exported by Service, so let's require it.
        const HDWalletDB = require('./database');

        const deposit = await HDWalletDB.getPendingDeposit(address, chain);
        if (deposit) {
          console.log(`Found pending deposit ${deposit.id} for ${address} detected balance ${balance}`);

          // Check if balance matches amount (or is sufficient within margin?)
          // Usually, user says "I will deposit 100", but on chain they might deposit 100.
          // If they deposit LESS, we credit actual. If MORE, credit actual.
          // So we use the actual on-chain balance to calculate credit.

          // Fetch asset/symbol to get price
          // Deposit has asset_id, but we need symbol.
          // The chain might imply the native asset, or we might need to look up.
          // If it's a token check (not supported in this simple cron yet logic-wise unless arguments passed), 
          // we assume native chain currency for now unless expanded.

          let symbol;
          const walletInfo = WalletService.SUPPORTED_WALLETS[chain];
          if (walletInfo) {
            symbol = walletInfo.nativeCurrency;
          } else {
            symbol = chain; // Fallback
          }

          // Fetch Price
          const price = await WalletService.fetchCryptoPrice(symbol);
          console.log(`Fetched price for ${symbol}: $${price}`);

          const usdAmount = balanceFloat * price;
          console.log(`Crediting user with $${usdAmount} (${balanceFloat} ${symbol} * ${price})`);

          // Confirm
          await HDWalletDB.confirmDeposit(deposit.id, price, usdAmount);

          console.log(`Deposit ${deposit.id} confirmed and user credited.`);

          // Stop task early as success
          task.stop();
          await broadcast("balances", "deposit-confirmed", {
            depositId: deposit.id,
            usdAmount,
            address
          });
          return;
        }
      }
    } catch (err) {
      console.error("Error checking balance:", err.message);
    }

    if (runCount >= 5) {
      task.stop();

      // Broadcast finished event
      await broadcast("balances", "balance-finished", {
        address,
        chain,
        message: "Balance polling finished after 5 runs",
      });

      console.log("Stopped balance polling after 5 minutes.");
    }
  });

  task.start();
}

// Export the function directly for simple requires, and keep named export for compatibility
module.exports = startBalanceCron;
module.exports.startBalanceCron = startBalanceCron;
