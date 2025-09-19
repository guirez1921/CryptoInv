const Pusher = require("pusher");
const dotenv = require("dotenv");

dotenv.config({ path: "../.env" });

const pusher = new Pusher({
  appId: process.env.REVERB_APP_ID,
  key: process.env.REVERB_APP_KEY,
  secret: process.env.REVERB_APP_SECRET,
  host: process.env.REVERB_HOST,
  port: process.env.REVERB_PORT,
  scheme: process.env.REVERB_SCHEME,
  useTLS: process.env.REVERB_SCHEME === "https",
});


/**
 * Broadcast a deposit event for a specific account and chain.
 * @param {string|number} accountId
 * @param {number|string} amount
 * @param {string} chain
 * @param {string|number} transactionId
 */
async function broadcastDeposit(accountId, amount, chain, transactionId) {
  try {
    await pusher.trigger(`account.${accountId}`, "DepositReceived", {
      accountId,
      amount,
      chain,
      transactionId,
      timestamp: new Date().toISOString(),
    });

    console.log(`Broadcasted deposit for account ${accountId}: ${amount} ${chain} (tx: ${transactionId})`);
  } catch (err) {
    console.error("Broadcast error:", err);
  }
}

module.exports = { broadcastDeposit };