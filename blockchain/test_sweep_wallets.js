const WalletService = require('./service');
const DB = require('./database');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function runPhase2() {
    console.log("=== PHASE 2: SWEEP TO MASTER ===");

    // Parse args if provided, else prompt
    // Usage: node test_sweep_wallets.js [walletId]
    const args = process.argv.slice(2);
    let hdWalletId = args[0];

    try {
        if (!hdWalletId) {
            hdWalletId = await askQuestion("Enter HD Wallet ID from Phase 1: ");
        }

        console.log(`\nUsing HD Wallet ID: ${hdWalletId}`);
        const allAddrs = await WalletService.getAllAddressesForHDWallet(hdWalletId);

        // Filter for our test chains
        const testChains = ['sepolia', 'bitcoinTestnet', 'solanaDevnet', 'tronNile'];
        const targets = allAddrs.addresses.filter(a => testChains.includes(a.chain || '')); // Note: Check how chain is stored in getWalletAddresses

        // Just in case chain isn't on the address object directly in getAllAddressesForHDWallet return.
        // Looking at service.js: addresses map includes 'chain' implicitly via DB schema? 
        // No, 'createWalletAddress' stores 'chain'. 'getWalletAddresses' creates objects. 
        // service.js/getAllAddressesForHDWallet unfortunately doesn't explicitly map 'chain' in the 'map' function at line 1180.
        // Wait, line 1180 map doesn't include 'chain'. 
        // We will need to fetch DB directly or rely on logic. 
        // Actually, let's just use the addresses by string and ask user or infer.
        // Better: Fetch fresh addresses with chain info.

        const dbAddresses = await DB.getWalletAddresses(hdWalletId); // Direct DB call to get chain info
        const addressesToSweep = dbAddresses.filter(a => testChains.includes(a.chain));

        if (addressesToSweep.length === 0) {
            console.log("No addresses found for test chains (sepolia, bitcoinTestnet, solanaDevnet, tronNile).");
            process.exit(0);
        }

        // 1. Check Balances First
        console.log("\n1. Checking Current Balances (Post-Funding)...");
        const sweepable = [];

        for (const addr of addressesToSweep) {
            try {
                const balance = await WalletService.checkBalance(addr.address, addr.chain, addr.asset);
                const assetLabel = addr.asset ? addr.asset : 'Native';
                console.log(`   ${addr.chain} [${assetLabel}]: ${addr.address} = ${balance}`);

                if (parseFloat(balance) > 0) {
                    sweepable.push({ ...addr, balance });
                }
            } catch (e) {
                console.error(`   Error checking balance for ${addr.chain}: ${e.message}`);
            }
        }

        if (sweepable.length === 0) {
            console.log("\nNo funds detected! Please fund the wallets and try again.");
            process.exit(0);
        }

        console.log(`\nFound ${sweepable.length} wallets with funds.`);
        const proceed = await askQuestion("\nDo you want to proceed with Sweep? (y/n): ");
        if (proceed.toLowerCase() !== 'y') {
            console.log("Aborted.");
            process.exit(0);
        }

        // 2. Ask for Master Addresses
        console.log("\n2. Configure Master Addresses for Sweep...");
        // Default dummy addresses if user just hits enter, for safety valid format but burn addresses
        const masterAddresses = {};

        masterAddresses['sepolia'] = await askQuestion("Enter Master ETH (Sepolia) Address: ");
        masterAddresses['bitcoinTestnet'] = await askQuestion("Enter Master BTC (Testnet) Address: ");
        masterAddresses['solanaDevnet'] = await askQuestion("Enter Master SOL (Devnet) Address: ");
        masterAddresses['tronNile'] = await askQuestion("Enter Master TRX (Nile) Address: ");

        // 3. Execute Sweeps
        console.log("\n3. Executing Transfers...");

        for (const wallet of sweepable) {
            const chain = wallet.chain;
            const dest = masterAddresses[chain];

            if (!dest) {
                console.log(`   Skipping ${chain} (No master address provided).`);
                continue;
            }

            console.log(`\n   >>> Sweeping ${chain} [${wallet.asset || 'Native'}] (${wallet.balance}) from ${wallet.address} to ${dest}...`);
            try {
                // Call TransferToMaster (Sweep Mode)
                const result = await WalletService.transferToMaster(hdWalletId, dest, chain, wallet.asset);
                console.log(`   SUCCESS! Tx Hash: ${result.txHash}`);
                console.log(`   Gas Paid: ${result.gasFee}`);
                console.log(`   Explorer: ${result.blockchainUrl}`);
            } catch (e) {
                console.error(`   FAILED: ${e.message}`);
            }
        }

        console.log("\nPhase 2 Complete.");

    } catch (error) {
        console.error("PHASE 2 ERROR:", error);
    } finally {
        rl.close();
        await DB.closePool();
    }
}

runPhase2();
