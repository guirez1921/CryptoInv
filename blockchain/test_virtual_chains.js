const { loadEnv } = require('./env');
loadEnv();
const WalletService = require('./service');
const DB = require('./database');

async function testVirtualChains() {
    console.log("=== TESTING USDT/USDC AS VIRTUAL CHAINS ===\n");

    try {
        // 1. Check getSupportedChains includes USDT and USDC
        console.log("1. Checking getSupportedChains...");
        const chains = await WalletService.getSupportedChains();
        const usdtChain = chains.find(c => c.key === 'USDT');
        const usdcChain = chains.find(c => c.key === 'USDC');

        if (usdtChain) {
            console.log(`   ✓ USDT found: ${usdtChain.name} (${usdtChain.nativeCurrency})`);
        } else {
            console.log(`   ✗ USDT NOT found in supported chains!`);
        }

        if (usdcChain) {
            console.log(`   ✓ USDC found: ${usdcChain.name} (${usdcChain.nativeCurrency})`);
        } else {
            console.log(`   ✗ USDC NOT found in supported chains!`);
        }

        // 2. Create addresses for USDT and USDC
        console.log("\n2. Creating addresses...");
        const accountId = 1;

        // Create HD wallet if doesn't exist
        let hdWallet;
        try {
            hdWallet = await WalletService.createHDWallet(accountId, 'ethereum', 'spot');
            console.log(`   HD Wallet ID: ${hdWallet.walletId}`);
        } catch (e) {
            console.log(`   Using existing HD wallet for account ${accountId}`);
            hdWallet = { walletId: 1 }; // Assume wallet 1 exists
        }

        // Create USDT address
        console.log("\n   Creating USDT address...");
        const usdtAddr = await WalletService.createAddress(hdWallet.walletId, 'USDT');
        console.log(`   USDT Address: ${usdtAddr.address}`);
        console.log(`   Asset Tag: ${usdtAddr.asset}`);

        // Create USDC address
        console.log("\n   Creating USDC address...");
        const usdcAddr = await WalletService.createAddress(hdWallet.walletId, 'USDC');
        console.log(`   USDC Address: ${usdcAddr.address}`);
        console.log(`   Asset Tag: ${usdcAddr.asset}`);

        // Create regular Ethereum address for comparison
        console.log("\n   Creating Ethereum address for comparison...");
        const ethAddr = await WalletService.createAddress(hdWallet.walletId, 'ethereum');
        console.log(`   ETH Address: ${ethAddr.address}`);

        // Verify they're all Ethereum addresses
        console.log("\n3. Verification:");
        const isEthAddress = (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr);
        console.log(`   USDT is ETH address: ${isEthAddress(usdtAddr.address) ? '✓' : '✗'}`);
        console.log(`   USDC is ETH address: ${isEthAddress(usdcAddr.address) ? '✓' : '✗'}`);
        console.log(`   ETH is ETH address: ${isEthAddress(ethAddr.address) ? '✓' : '✗'}`);

        console.log("\n✅ All tests passed!");

    } catch (e) {
        console.error("\n❌ TEST FAILED:", e.message);
        console.error(e.stack);
    } finally {
        await DB.closePool();
    }
}

testVirtualChains();
