#!/usr/bin/env node

/**
 * Wallet Address Recovery Script
 * 
 * This script regenerates all wallet addresses for each HD wallet
 * based on the stored mnemonic. Useful for recovery scenarios.
 * 
 * Usage: node blockchain/recover-addresses.js [hdWalletId]
 */

const { loadEnv } = require('./env');
loadEnv();

const DB = require('./database');
const WalletService = require('./service');

async function recoverAddressesForWallet(hdWalletId) {
    console.log(`\n🔄 Recovering addresses for HD Wallet ID: ${hdWalletId}`);

    try {
        // Get wallet info
        const wallet = await DB.getHDWallet(hdWalletId);
        if (!wallet) {
            console.error(`❌ Wallet ${hdWalletId} not found`);
            return;
        }

        // Get existing addresses from database
        const existingAddresses = await DB.getWalletAddresses(hdWalletId);
        console.log(`📋 Found ${existingAddresses.length} existing addresses in database`);

        // Get decrypted mnemonic
        const mnemonic = await DB.getDecryptedSeed(hdWalletId);
        console.log(`✅ Successfully decrypted mnemonic`);

        // Group addresses by chain
        const addressesByChain = {};
        existingAddresses.forEach(addr => {
            const key = `${addr.chain}_${addr.asset || 'native'}`;
            if (!addressesByChain[key]) {
                addressesByChain[key] = [];
            }
            addressesByChain[key].push(addr);
        });

        console.log(`\n🔍 Verifying addresses...`);
        let matched = 0;
        let mismatched = 0;

        // Verify each address can be regenerated
        for (const [key, addresses] of Object.entries(addressesByChain)) {
            const [chain, assetType] = key.split('_');
            const asset = assetType === 'native' ? null : assetType;

            for (const addr of addresses) {
                try {
                    // Regenerate address using same index
                    const regenerated = await WalletService.createAddress(
                        hdWalletId,
                        chain,
                        addr.address_index,
                        asset
                    );

                    if (regenerated.address.toLowerCase() === addr.address.toLowerCase()) {
                        console.log(`  ✅ ${chain} [${addr.address_index}]: ${addr.address.substring(0, 10)}... MATCH`);
                        matched++;
                    } else {
                        console.log(`  ❌ ${chain} [${addr.address_index}]: MISMATCH`);
                        console.log(`     DB: ${addr.address}`);
                        console.log(`     Regenerated: ${regenerated.address}`);
                        mismatched++;
                    }
                } catch (error) {
                    console.log(`  ⚠️  ${chain} [${addr.address_index}]: Error - ${error.message}`);
                    mismatched++;
                }
            }
        }

        console.log(`\n📊 Recovery Summary:`);
        console.log(`   Matched: ${matched}`);
        console.log(`   Mismatched: ${mismatched}`);
        console.log(`   Total: ${existingAddresses.length}`);

        if (mismatched === 0) {
            console.log(`\n✅ All addresses verified successfully!`);
        } else {
            console.log(`\n⚠️  WARNING: ${mismatched} addresses could not be verified`);
            console.log(`   This may indicate:`);
            console.log(`   - Wrong encryption key`);
            console.log(`   - Corrupted mnemonic`);
            console.log(`   - Different derivation paths`);
        }

    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        console.error(error.stack);
    }
}

async function recoverAllWallets() {
    console.log(`🔄 Recovering all HD wallets...`);

    try {
        const pool = await DB.getPool();
        const [wallets] = await pool.execute('SELECT id, account_id FROM hd_wallets ORDER BY id');

        console.log(`Found ${wallets.length} HD wallets\n`);

        for (const wallet of wallets) {
            await recoverAddressesForWallet(wallet.id);
        }

        console.log(`\n✅ Recovery process complete`);
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
    }
}

// Main execution
(async () => {
    const args = process.argv.slice(2);

    if (args[0] === '--all') {
        await recoverAllWallets();
    } else if (args[0]) {
        const walletId = parseInt(args[0]);
        if (isNaN(walletId)) {
            console.error('Invalid wallet ID. Usage: node recover-addresses.js [walletId]');
            process.exit(1);
        }
        await recoverAddressesForWallet(walletId);
    } else {
        console.log('Usage:');
        console.log('  node blockchain/recover-addresses.js [walletId]  - Recover specific wallet');
        console.log('  node blockchain/recover-addresses.js --all       - Recover all wallets');
        process.exit(0);
    }

    // Close database
    try {
        await DB.closePool();
    } catch (e) {
        // ignore
    }

    process.exit(0);
})();
