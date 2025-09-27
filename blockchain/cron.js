// balanceCron.js
const cron = require("node-cron");
const WalletService = require("./service");
const { broadcast } = require("./broadcast");

async function startBalanceCron(address, chain) {
  let runCount = 0;

  const task = cron.schedule("* * * * *", async () => {
    runCount++;

    try {
      const balance = await WalletService.checkBalance(address, chain);

      // Broadcast balance update
      await broadcast("balances", "balance-update", {
        address,
        chain,
        balance,
        run: runCount,
      });

      console.log(`Run ${runCount}: ${chain} balance for ${address} = ${balance}`);
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

module.exports = { startBalanceCron };
