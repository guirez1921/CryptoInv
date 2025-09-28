// Ensure we load the Laravel .env so the blockchain JS uses the same environment variables.
// try {
//   require('./env').loadEnv();
// } catch (e) {
//   // not fatal
// }
const WalletService = require('./service');
const startBalanceCron = require('./cron');
const DB = require('./database');

(async () => {
  const [, , fn, ...args] = process.argv;

  try {
    let result;

    switch (fn) {
      case 'createHDWallet':
        result = await WalletService.createHDWallet(
          args[0],
          args[1],
          args[2]
        );
        break;

      case 'createAddress':
        result = await WalletService.createAddress(
          args[0], // hdWalletId
          args[1], // chain
          args[2] ? parseInt(args[2]) : null
        );
        break;

      case 'checkBalance':
        result = await WalletService.checkBalance(
          args[0], // walletAddress
          args[1]  // chain
        );
        break;

      case 'transferToMaster':
        result = await WalletService.transferToMaster(
          args[0], // fromWalletId
          args[1], // toMasterAddress
          args[2], // amount
          args[3], // chain
          args[4] ?? null // assetId (optional)
        );
        break;

      case 'getWalletDetails':
        result = await WalletService.getWalletDetails(
          args[0] // walletId
        );
        break;

      case 'getSupportedChains':
        result = await WalletService.getSupportedChains();
        break;

      case 'startBalanceCheck':
        result = await startBalanceCron(
          args[0], // address
          args[1]  // chain
        );
        break;

      // --- Newly added cases ---
      case 'getAllAddressesForHDWallet':
        result = await WalletService.getAllAddressesForHDWallet(
          args[0] // hdWalletId
        );
        break;

      case 'getAddressesOnChain':
        // options can be passed as JSON string
        const options = args[2] ? JSON.parse(args[2]) : {};
        result = await WalletService.getAddressesOnChain(
          args[0], // accountId
          args[1], // chain
          options
        );
        break;

      case 'getAddressSummaryAllChains':
        result = await WalletService.getAddressSummaryAllChains(
          args[0] // accountId
        );
        break;

      case 'syncHDWalletBalances':
        result = await WalletService.syncHDWalletBalances(
          args[0] // hdWalletId
        );
        break;

      default:
        throw new Error(`Unknown function: ${fn}`);
    }

    // Close DB pool to allow the process to exit cleanly
    try {
      if (DB && typeof DB.closePool === 'function') {
        await DB.closePool();
      }
    } catch (e) {
      // ignore
    }

    // Print the result after DB shutdown so there are no open DB sockets keeping Node alive
    console.log(JSON.stringify(result));

    // Final small delay to let stdout/stderr flush, then exit
    setTimeout(() => process.exit(0), 50);
  } catch (err) {
    // Print full stack to help debugging from the PHP side
    if (err && err.stack) {
      console.error(err.stack);
    } else {
      console.error(err ? err.toString() : 'Unknown error');
    }
    try {
      if (DB && typeof DB.closePool === 'function') {
        await DB.closePool();
      }
    } catch (e) {
      // ignore
    }
    process.exit(1);
  }
})();
