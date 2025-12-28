const WalletService = require('./service');
const DB = require('./database');

async function runPhase1() {
    console.log("=== PHASE 1: WALLET SETUP & ADDRESS GENERATION ===");

    try {
        // 1. Create HD Wallet for User 1
        console.log("\n1. Creating HD Wallet for User 1...");
        // Using a random account ID if user 1 already exists, or strictly usage 1
        // Ideally we assume user ID 1 for this test.
        const accountId = 1;
        let hdWallet = await WalletService.createHDWallet(accountId, 'sepolia', 'spot');
        // If it returns existing wallet, handle it
        if (!hdWallet || !hdWallet.walletId) {
            // It might return the object directly if created via Service.createHDWallet return signature
            if (hdWallet.id) {
                hdWallet = { walletId: hdWallet.id, ...hdWallet };
            } else {
                console.log("   HD Wallet might already exist or partial return.");
            }
        }
        console.log(`   HD Wallet ID: ${hdWallet.walletId}`);

        // Chains to test
        const testChains = ['sepolia', 'bitcoinTestnet', 'solanaDevnet', 'tronNile'];
        // Note: tronNile or tronShasta depending on what is in service.js map. service.js has 'tronShasta' and 'tronNile'. 
        // Using 'tronNile' based on standard testnets usually being Nile for broader Tron tests, or matching service.js map.

        const addresses = {};

        // 2. Create Addresses for each chain
        console.log("\n2. Generating Addresses...");
        for (const chain of testChains) {
            try {
                console.log(`   Creating address for ${chain}...`);
                const walletAddr = await WalletService.createAddress(hdWallet.walletId, chain);
                addresses[chain] = walletAddr.address;
                console.log(`   -> ${chain}: ${walletAddr.address}`);
            } catch (e) {
                console.error(`   Failed to create address for ${chain}: ${e.message}`);
            }
        }

        // Setup USDT and USDC on Sepolia
        try {
            console.log("   Creating address for USDT (Sepolia)...");
            const usdtAddr = await WalletService.createAddress(hdWallet.walletId, 'sepolia', null, 'USDT');
            addresses['USDT-Sepolia'] = usdtAddr.address;
            console.log(`   -> USDT-Sepolia: ${usdtAddr.address}`);

            console.log("   Creating address for USDC (Sepolia)...");
            const usdcAddr = await WalletService.createAddress(hdWallet.walletId, 'sepolia', null, 'USDC');
            addresses['USDC-Sepolia'] = usdcAddr.address;
            console.log(`   -> USDC-Sepolia: ${usdcAddr.address}`);
        } catch (e) {
            console.error(`   Failed to create token addresses: ${e.message}`);
        }

        // 3. Test Non-Transaction Functions
        console.log("\n3. Testing Read-Only Functions...");

        // getWalletDetails
        console.log("   Testing getWalletDetails...");
        const details = await WalletService.getWalletDetails(hdWallet.walletId);
        console.log(`   -> Wallet Type: ${details.type}, Total Addresses: ${details.addressCount}`);

        // getSupportedChains
        console.log("   Testing getSupportedChains...");
        const chains = await WalletService.getSupportedChains();
        console.log(`   -> Supported Chains Count: ${chains.length}`);

        // getAllAddressesForHDWallet
        console.log("   Testing getAllAddressesForHDWallet...");
        const allAddrs = await WalletService.getAllAddressesForHDWallet(hdWallet.walletId);
        console.log(`   -> Correctly fetched ${allAddrs.totalAddresses} addresses.`);

        // 4. Check initial balances (should be 0)
        console.log("\n4. Checking Initial Balances...");
        for (const chain of testChains) {
            if (!addresses[chain]) continue;
            try {
                const balance = await WalletService.checkBalance(addresses[chain], chain);
                console.log(`   ${chain} Balance: ${balance}`);
            } catch (e) {
                console.error(`   Failed to check balance for ${chain}: ${e.message}`);
            }
        }

        // Check token balances
        if (addresses['USDT-Sepolia']) {
            try {
                const bal = await WalletService.checkBalance(addresses['USDT-Sepolia'], 'sepolia', 'USDT');
                console.log(`   USDT-Sepolia Balance: ${bal}`);
            } catch (e) {
                console.error(`   Failed to check USDT balance: ${e.message}`);
            }
        }
        if (addresses['USDC-Sepolia']) {
            try {
                const bal = await WalletService.checkBalance(addresses['USDC-Sepolia'], 'sepolia', 'USDC');
                console.log(`   USDC-Sepolia Balance: ${bal}`);
            } catch (e) {
                console.error(`   Failed to check USDC balance: ${e.message}`);
            }
        }

        // 5. Output Addresses for Funding
        console.log("\n\n========================================================");
        console.log("   PLEASE FUND THE FOLLOWING WALLETS FOR PHASE 2");
        console.log("========================================================");
        console.log(`   HD WALLET ID: ${hdWallet.walletId}`);
        console.log("--------------------------------------------------------");
        for (const [chain, addr] of Object.entries(addresses)) {
            console.log(`   ${chain.padEnd(15)}: ${addr}`);
        }
        console.log("========================================================\n");
        console.log("Run 'node test_sweep_wallets.js <hdWalletId> <masterEth> <masterBtc> <masterSol> <masterTrx>' to start Phase 2.");

        // Keep raw data for user convenience to verify
        const jsonOutput = {
            hdWalletId: hdWallet.walletId,
            addresses: addresses
        };
        console.log("JSON Output for reference:");
        console.log(JSON.stringify(jsonOutput, null, 2));

    } catch (error) {
        console.error("PHASE 1 FAILED:", error);
    } finally {
        await DB.closePool();
    }
}

runPhase1();
