// services/walletService.js - Fixed version with proper exports
const { ethers } = require('ethers');
const bitcoin = require('bitcoinjs-lib');
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const bip39 = require('bip39');
const bip32 = require('bip32');
const HDWalletDB = require('./database');

const rpcMap = {
    // Ethereum and EVM chains
    ethereum: "https://mainnet.infura.io/v3/17405663a8354f2daef2178409d0fc84",
    sepolia: "https://sepolia.infura.io/v3/17405663a8354f2daef2178409d0fc84",
    polygon: "https://polygon-mainnet.infura.io/v3/17405663a8354f2daef2178409d0fc84",
    base: "https://base-mainnet.infura.io/v3/17405663a8354f2daef2178409d0fc84",
    avalanche: "https://avalanche-mainnet.infura.io/v3/17405663a8354f2daef2178409d0fc84",
    optimism: "https://optimism-mainnet.infura.io/v3/17405663a8354f2daef2178409d0fc84",
    arbitrum: "https://arbitrum-mainnet.infura.io/v3/17405663a8354f2daef2178409d0fc84",
    bsc: "https://bsc-mainnet.infura.io/v3/17405663a8354f2daef2178409d0fc84",
    // Bitcoin
    bitcoin: "https://blockstream.info/api",
    bitcoinTestnet: "https://blockstream.info/testnet/api",
    // Solana
    solana: "https://api.mainnet-beta.solana.com",
    solanaDevnet: "https://api.devnet.solana.com",
};

const derivationPaths = {
    "BTC": "m/44'/0'/0'/0",
    "ETH": "m/44'/60'/0'/0",
    "SOL": "m/44'/501'/0'/0'"
};

const SUPPORTED_WALLETS = {
    // EVM chains
    ethereum: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH' },
    sepolia: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH' },
    polygon: { type: 'EVM', coinType: 60, nativeCurrency: 'MATIC' },
    polygonAmoy: { type: 'EVM', coinType: 60, nativeCurrency: 'MATIC' },
    base: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH' },
    baseSepolia: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH' },
    avalanche: { type: 'EVM', coinType: 60, nativeCurrency: 'AVAX' },
    avalancheFuji: { type: 'EVM', coinType: 60, nativeCurrency: 'AVAX' },
    optimism: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH' },
    optimismSepolia: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH' },
    arbitrum: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH' },
    arbitrumSepolia: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH' },
    bsc: { type: 'EVM', coinType: 60, nativeCurrency: 'BNB' },
    bscTestnet: { type: 'EVM', coinType: 60, nativeCurrency: 'BNB' },
    linea: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH' },
    lineaSepolia: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH' },
    blast: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH' },
    blastSepolia: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH' },
    palm: { type: 'EVM', coinType: 60, nativeCurrency: 'PALM' },
    palmTestnet: { type: 'EVM', coinType: 60, nativeCurrency: 'PALM' },
    starknet: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH' },
    starknetSepolia: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH' },
    celo: { type: 'EVM', coinType: 60, nativeCurrency: 'CELO' },
    celoAlfajores: { type: 'EVM', coinType: 60, nativeCurrency: 'CELO' },
    zksync: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH' },
    zksyncSepolia: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH' },
    mantle: { type: 'EVM', coinType: 60, nativeCurrency: 'MNT' },
    mantleSepolia: { type: 'EVM', coinType: 60, nativeCurrency: 'MNT' },
    opbnb: { type: 'EVM', coinType: 60, nativeCurrency: 'BNB' },
    opbnbTestnet: { type: 'EVM', coinType: 60, nativeCurrency: 'BNB' },
    scroll: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH' },
    scrollSepolia: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH' },
    sei: { type: 'EVM', coinType: 60, nativeCurrency: 'SEI' },
    seiTestnet: { type: 'EVM', coinType: 60, nativeCurrency: 'SEI' },
    swellchain: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH' },
    swellchainTestnet: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH' },
    unichain: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH' },
    unichainSepolia: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH' },
    // Bitcoin
    bitcoin: { type: 'BTC', coinType: 0, nativeCurrency: 'BTC' },
    bitcoinTestnet: { type: 'BTC', coinType: 1, nativeCurrency: 'BTC' },
    // Solana
    solana: { type: 'SOL', coinType: 501, nativeCurrency: 'SOL' },
    solanaDevnet: { type: 'SOL', coinType: 501, nativeCurrency: 'SOL' },
};

class WalletService {
    // 1. Create HD Wallet
    static async createHDWallet(accountId, chain = 'ethereum', type = 'spot') {
        try {
            // Generate mnemonic
            const mnemonic = bip39.generateMnemonic();

            // Create HD wallet in database
            const hdWallet = await HDWalletDB.createHDWallet(accountId, mnemonic, chain, type);

            // Generate the first address
            const firstAddress = await this.createAddress(hdWallet.id, chain, 0);

            return {
                walletId: hdWallet.id,
                mnemonic: mnemonic, // Return only for initial setup - should be stored securely by client
                firstAddress: firstAddress.address,
                chain: chain
            };
        } catch (error) {
            throw new Error(`Failed to create HD wallet: ${error.message}`);
        }
    }

    // 2. Create address for wallet
    static async createAddress(hdWalletId, chain, addressIndex = null) {
        try {
            const hdWallet = await HDWalletDB.getHDWallet(hdWalletId);
            if (!hdWallet) throw new Error('HD Wallet not found');

            const seed = await HDWalletDB.getDecryptedSeed(hdWalletId);
            const seedBuffer = bip39.mnemonicToSeedSync(seed);

            // Use provided index or increment from current
            const index = addressIndex !== null ? addressIndex : hdWallet.address_index + 1;

            let address, derivationPath;
            const walletType = SUPPORTED_WALLETS[chain];

            if (!walletType) {
                throw new Error(`Unsupported chain: ${chain}`);
            }

            switch (walletType.type) {
                case 'EVM':
                    ({ address, derivationPath } = this.generateEVMAddress(seedBuffer, index));
                    break;
                case 'BTC':
                    ({ address, derivationPath } = this.generateBTCAddress(seedBuffer, index, chain.includes('testnet')));
                    break;
                case 'SOL':
                    ({ address, derivationPath } = this.generateSOLAddress(seedBuffer, index));
                    break;
                default:
                    throw new Error(`Unknown wallet type: ${walletType.type}`);
            }

            // Save to database
            const walletAddress = await HDWalletDB.createWalletAddress(
                hdWalletId,
                address,
                index,
                derivationPath,
                chain
            );

            // Update HD wallet's address index if we used the next sequential index
            if (addressIndex === null && index > hdWallet.address_index) {
                await HDWalletDB.updateAddressIndex(hdWalletId, index);
            }

            return walletAddress;
        } catch (error) {
            throw new Error(`Failed to create address: ${error.message}`);
        }
    }

    // Generate EVM address (Ethereum, Polygon, BSC, etc.)
    static generateEVMAddress(seedBuffer, index) {
        const derivationPath = `${derivationPaths.ETH}/${index}`;
        const hdNode = bip32.fromSeed(seedBuffer);
        const child = hdNode.derivePath(derivationPath);
        const wallet = new ethers.Wallet(child.privateKey);

        return {
            address: wallet.address,
            derivationPath
        };
    }

    // Generate Bitcoin address
    static generateBTCAddress(seedBuffer, index, isTestnet = false) {
        const network = isTestnet ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
        const derivationPath = `${derivationPaths.BTC}/${index}`;
        const hdNode = bip32.fromSeed(seedBuffer, network);
        const child = hdNode.derivePath(derivationPath);

        const { address } = bitcoin.payments.p2pkh({
            pubkey: child.publicKey,
            network
        });

        return {
            address,
            derivationPath
        };
    }

    // Generate Solana address
    static generateSOLAddress(seedBuffer, index) {
        const derivationPath = `${derivationPaths.SOL}/${index}`;
        const hdNode = bip32.fromSeed(seedBuffer);
        const child = hdNode.derivePath(derivationPath.replace("'", ""));

        const publicKey = new PublicKey(child.publicKey);

        return {
            address: publicKey.toString(),
            derivationPath
        };
    }

    // 3. Check balance of wallet
    static async checkBalance(walletAddress, chain) {
        try {
            const walletType = SUPPORTED_WALLETS[chain];
            if (!walletType) throw new Error(`Unsupported chain: ${chain}`);

            let balance = 0;

            switch (walletType.type) {
                case 'EVM':
                    balance = await this.getEVMBalance(walletAddress, chain);
                    break;
                case 'BTC':
                    balance = await this.getBTCBalance(walletAddress, chain);
                    break;
                case 'SOL':
                    balance = await this.getSOLBalance(walletAddress, chain);
                    break;
            }

            // Update balance in database
            const dbWalletAddress = await HDWalletDB.getWalletAddressByString(walletAddress);
            if (dbWalletAddress) {
                await HDWalletDB.updateWalletBalance(dbWalletAddress.id, balance);
            }

            return balance;
        } catch (error) {
            throw new Error(`Failed to check balance: ${error.message}`);
        }
    }

    // Get EVM balance
    static async getEVMBalance(address, chain) {
        const rpcUrl = rpcMap[chain];
        if (!rpcUrl) throw new Error(`RPC URL not found for chain: ${chain}`);

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const balance = await provider.getBalance(address);
        return ethers.formatEther(balance);
    }

    // Get Bitcoin balance
    static async getBTCBalance(address, chain) {
        const baseUrl = rpcMap[chain];
        const response = await fetch(`${baseUrl}/address/${address}`);
        const data = await response.json();

        // Convert satoshis to BTC
        return (data.chain_stats.funded_txo_sum / 100000000).toString();
    }

    // Get Solana balance
    static async getSOLBalance(address, chain) {
        const rpcUrl = rpcMap[chain];
        const connection = new Connection(rpcUrl);
        const publicKey = new PublicKey(address);
        const balance = await connection.getBalance(publicKey);

        return (balance / LAMPORTS_PER_SOL).toString();
    }

    // 4. Transfer asset to master wallet (withdrawal simulation)
    static async transferToMaster(fromWalletId, toMasterAddress, amount, chain, assetId = null) {
        try {
            // Get wallet details
            const hdWallet = await HDWalletDB.getHDWallet(fromWalletId);
            if (!hdWallet) throw new Error('HD Wallet not found');

            const addresses = await HDWalletDB.getWalletAddresses(fromWalletId);
            const fromAddress = addresses.find(addr => parseFloat(addr.balance) >= parseFloat(amount));

            if (!fromAddress) {
                throw new Error('Insufficient balance in wallet addresses');
            }

            // Create blockchain transaction record
            const txData = {
                accountId: hdWallet.account_id,
                hdWalletId: fromWalletId,
                walletAddressId: fromAddress.id,
                chain: chain,
                type: 'withdrawal',
                fromAddress: fromAddress.address,
                toAddress: toMasterAddress,
                amount: amount,
                status: 'pending',
                assetId: assetId
            };

            const transaction = await HDWalletDB.createBlockchainTransaction(txData);

            // Simulate the transfer (in real implementation, you'd broadcast to blockchain)
            const walletType = SUPPORTED_WALLETS[chain];
            let txHash, estimatedGasFee;

            switch (walletType.type) {
                case 'EVM':
                    ({ txHash, estimatedGasFee } = await this.simulateEVMTransfer(fromAddress.address, toMasterAddress, amount, chain));
                    break;
                case 'BTC':
                    ({ txHash, estimatedGasFee } = await this.simulateBTCTransfer(fromAddress.address, toMasterAddress, amount, chain));
                    break;
                case 'SOL':
                    ({ txHash, estimatedGasFee } = await this.simulateSOLTransfer(fromAddress.address, toMasterAddress, amount, chain));
                    break;
                default:
                    throw new Error(`Unsupported wallet type: ${walletType.type}`);
            }

            // Update transaction with hash and fee
            await HDWalletDB.updateTransactionStatus(
                transaction.id,
                'processing',
                txHash,
                null,
                new Date()
            );

            // Update wallet balance (subtract amount + fees)
            const newBalance = parseFloat(fromAddress.balance) - parseFloat(amount) - parseFloat(estimatedGasFee);
            await HDWalletDB.updateWalletBalance(fromAddress.id, newBalance.toString());

            return {
                transactionId: transaction.id,
                txHash: txHash,
                fromAddress: fromAddress.address,
                toAddress: toMasterAddress,
                amount: amount,
                gasFee: estimatedGasFee,
                status: 'processing'
            };
        } catch (error) {
            throw new Error(`Transfer failed: ${error.message}`);
        }
    }

    // Simulate EVM transfer
    static async simulateEVMTransfer(fromAddress, toAddress, amount, chain) {
        // In real implementation, you'd use the private key to sign and send transaction
        const txHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        const estimatedGasFee = '0.002'; // ETH

        return { txHash, estimatedGasFee };
    }

    // Simulate BTC transfer
    static async simulateBTCTransfer(fromAddress, toAddress, amount, chain) {
        const txHash = Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        const estimatedGasFee = '0.00005'; // BTC

        return { txHash, estimatedGasFee };
    }

    // Simulate SOL transfer
    static async simulateSOLTransfer(fromAddress, toAddress, amount, chain) {
        const txHash = Array(88).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        const estimatedGasFee = '0.000005'; // SOL

        return { txHash, estimatedGasFee };
    }

    // Get wallet details
    static async getWalletDetails(walletId) {
        const hdWallet = await HDWalletDB.getHDWallet(walletId);
        if (!hdWallet) throw new Error('Wallet not found');

        const addresses = await HDWalletDB.getWalletAddresses(walletId);

        return {
            walletId: hdWallet.id,
            accountId: hdWallet.account_id,
            chain: hdWallet.chain,
            type: hdWallet.type,
            addressCount: addresses.length,
            addresses: addresses,
            totalBalance: addresses.reduce((sum, addr) => sum + parseFloat(addr.balance), 0).toString(),
            isActive: hdWallet.is_active,
            createdAt: hdWallet.created_at
        };
    }

    /**
     * Return a list of supported chains and basic metadata for each
     * @returns {Promise<Array<Object>>}
     */
    static async getSupportedChains() {
        try {
            const chains = Object.keys(SUPPORTED_WALLETS).map((key) => {
                const info = SUPPORTED_WALLETS[key] || {};
                const prettyName = (key || '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                const symbol = info.nativeCurrency || key.toUpperCase();
                return {
                    key,
                    // human friendly name (Title Case)
                    name: prettyName,
                    type: info.type || null,
                    coinType: info.coinType ?? null,
                    nativeCurrency: info.nativeCurrency || null,
                    // symbol used in UI (fallback to uppercase key)
                    symbol,
                    rpc: rpcMap[key] || null,
                    // sensible defaults for UI/clients
                    minDeposit: info.minDeposit ?? null,
                    withdrawalFee: info.withdrawalFee ?? null,
                };
            });

            return chains;
        } catch (error) {
            throw new Error(`Failed to get supported chains: ${error.message}`);
        }
    }

    /**
     * Get all addresses linked to an HD wallet
     * @param {number} hdWalletId - The ID of the HD wallet
     * @returns {Promise<Object>} Object containing wallet info and all addresses
     */
    static async getAllAddressesForHDWallet(hdWalletId) {
        try {
            // Get HD wallet details
            const hdWallet = await HDWalletDB.getHDWallet(hdWalletId);
            if (!hdWallet) {
                throw new Error('HD Wallet not found');
            }

            // Get all addresses for this HD wallet
            const addresses = await HDWalletDB.getWalletAddresses(hdWalletId);

            // Calculate total balance across all addresses
            const totalBalance = addresses.reduce((sum, addr) => {
                return sum + parseFloat(addr.balance || 0);
            }, 0);

            // Group addresses by their status for better organization
            const activeAddresses = addresses.filter(addr => addr.balance > 0);
            const emptyAddresses = addresses.filter(addr => addr.balance == 0);

            return {
                walletId: hdWallet.id,
                accountId: hdWallet.account_id,
                chain: hdWallet.chain,
                type: hdWallet.type,
                totalAddresses: addresses.length,
                activeAddresses: activeAddresses.length,
                emptyAddresses: emptyAddresses.length,
                totalBalance: totalBalance.toFixed(8),
                currentAddressIndex: hdWallet.address_index,
                addresses: addresses.map(addr => ({
                    id: addr.id,
                    address: addr.address,
                    addressIndex: addr.address_index,
                    derivationPath: addr.derivation_path,
                    balance: addr.balance,
                    lastSyncAt: addr.last_sync_at,
                    createdAt: addr.created_at,
                    updatedAt: addr.updated_at
                })),
                createdAt: hdWallet.created_at,
                updatedAt: hdWallet.updated_at,
                isActive: hdWallet.is_active
            };
        } catch (error) {
            throw new Error(`Failed to get addresses for HD wallet: ${error.message}`);
        }
    }

    /**
     * Get all addresses on a specific chain for an account
     * @param {number} accountId - The account ID
     * @param {string} chain - The blockchain chain (e.g., 'ethereum', 'bitcoin', 'solana')
     * @param {Object} options - Additional options
     * @param {boolean} options.includeEmpty - Include addresses with zero balance (default: true)
     * @param {string} options.type - Filter by wallet type ('spot', 'futures', etc.)
     * @param {boolean} options.activeOnly - Only return addresses from active wallets (default: true)
     * @returns {Promise<Object>} Object containing all addresses on the specified chain
     */
    static async getAddressesOnChain(accountId, chain, options = {}) {
        try {
            const { includeEmpty = true } = options;

            if (!SUPPORTED_WALLETS[chain]) {
                throw new Error(`Unsupported chain: ${chain}`);
            }

            const [hdWallets] = await HDWalletDB.getHDWalletsWithBalances(accountId, chain, options);
            const walletsWithAddresses = [];

            for (const hdWallet of hdWallets) {
                const [addresses] = await HDWalletDB.getAddressesForWallet(hdWallet.id, { includeEmpty });

                walletsWithAddresses.push({
                    hdWalletId: hdWallet.id,
                    type: hdWallet.type,
                    totalBalance: parseFloat(hdWallet.total_balance || 0).toFixed(8),
                    addressCount: addresses.length,
                    addresses: addresses.map(addr => ({
                        id: addr.id,
                        address: addr.address,
                        addressIndex: addr.address_index,
                        derivationPath: addr.derivation_path,
                        balance: addr.balance,
                        lastSyncAt: addr.last_sync_at,
                    })),
                });
            }

            const allAddresses = walletsWithAddresses.flatMap(w => w.addresses);
            const totalBalance = allAddresses.reduce((sum, addr) => sum + parseFloat(addr.balance || 0), 0);
            const activeAddresses = allAddresses.filter(addr => parseFloat(addr.balance) > 0);
            const chainInfo = SUPPORTED_WALLETS[chain];

            return {
                accountId,
                chain,
                chainType: chainInfo.type,
                nativeCurrency: chainInfo.nativeCurrency,
                statistics: {
                    totalWallets: walletsWithAddresses.length,
                    totalAddresses: allAddresses.length,
                    activeAddresses: activeAddresses.length,
                    emptyAddresses: allAddresses.length - activeAddresses.length,
                    totalBalance: totalBalance.toFixed(8),
                    currency: chainInfo.nativeCurrency,
                },
                wallets: walletsWithAddresses,
                addresses: allAddresses.sort((a, b) => {
                    const balanceDiff = parseFloat(b.balance) - parseFloat(a.balance);
                    return balanceDiff !== 0 ? balanceDiff : a.addressIndex - b.addressIndex;
                }),
            };
        } catch (error) {
            throw new Error(`Failed to get addresses on chain: ${error.message}`);
        }
    }
    // static async getAddressesOnChain(accountId, chain, options = {}) {
    //     try {
    //         const {
    //             includeEmpty = true,
    //             type = null,
    //             activeOnly = true
    //         } = options;

    //         // Validate chain
    //         if (!SUPPORTED_WALLETS[chain]) {
    //             throw new Error(`Unsupported chain: ${chain}`);
    //         }

    //         // Build query for HD wallets
    //         let query = `
    //     SELECT hw.*,
    //            COUNT(wa.id) as address_count,
    //            SUM(CAST(wa.balance AS DECIMAL(20,8))) as total_balance
    //     FROM hd_wallets hw
    //     LEFT JOIN wallet_addresses wa ON hw.id = wa.hd_wallet_id
    //     WHERE hw.account_id = ? AND hw.chain = ?
    //   `;

    //         const queryParams = [accountId, chain];

    //         if (activeOnly) {
    //             query += ' AND hw.is_active = 1';
    //         }

    //         if (type) {
    //             query += ' AND hw.type = ?';
    //             queryParams.push(type);
    //         }

    //         query += ' GROUP BY hw.id';

    //         const [hdWallets] = await pool.execute(query, queryParams);

    //         // Get all addresses for each HD wallet
    //         const walletsWithAddresses = [];

    //         for (const hdWallet of hdWallets) {
    //             // Get addresses for this HD wallet
    //             let addressQuery = `
    //       SELECT * FROM wallet_addresses
    //       WHERE hd_wallet_id = ?
    //     `;

    //             const addressParams = [hdWallet.id];

    //             if (!includeEmpty) {
    //                 addressQuery += ' AND balance > 0';
    //             }

    //             addressQuery += ' ORDER BY address_index';

    //             const [addresses] = await pool.execute(addressQuery, addressParams);

    //             walletsWithAddresses.push({
    //                 hdWalletId: hdWallet.id,
    //                 type: hdWallet.type,
    //                 totalBalance: parseFloat(hdWallet.total_balance || 0).toFixed(8),
    //                 addressCount: addresses.length,
    //                 addresses: addresses.map(addr => ({
    //                     id: addr.id,
    //                     address: addr.address,
    //                     addressIndex: addr.address_index,
    //                     derivationPath: addr.derivation_path,
    //                     balance: addr.balance,
    //                     lastSyncAt: addr.last_sync_at
    //                 }))
    //             });
    //         }

    //         // Aggregate statistics
    //         const allAddresses = walletsWithAddresses.flatMap(w => w.addresses);
    //         const totalBalance = allAddresses.reduce((sum, addr) => {
    //             return sum + parseFloat(addr.balance || 0);
    //         }, 0);

    //         const activeAddresses = allAddresses.filter(addr => parseFloat(addr.balance) > 0);

    //         // Get chain info
    //         const chainInfo = SUPPORTED_WALLETS[chain];

    //         return {
    //             accountId: accountId,
    //             chain: chain,
    //             chainType: chainInfo.type,
    //             nativeCurrency: chainInfo.nativeCurrency,
    //             statistics: {
    //                 totalWallets: walletsWithAddresses.length,
    //                 totalAddresses: allAddresses.length,
    //                 activeAddresses: activeAddresses.length,
    //                 emptyAddresses: allAddresses.length - activeAddresses.length,
    //                 totalBalance: totalBalance.toFixed(8),
    //                 currency: chainInfo.nativeCurrency
    //             },
    //             wallets: walletsWithAddresses,
    //             addresses: allAddresses.sort((a, b) => {
    //                 // Sort by balance (highest first), then by address index
    //                 const balanceDiff = parseFloat(b.balance) - parseFloat(a.balance);
    //                 return balanceDiff !== 0 ? balanceDiff : a.addressIndex - b.addressIndex;
    //             })
    //         };
    //     } catch (error) {
    //         throw new Error(`Failed to get addresses on chain: ${error.message}`);
    //     }
    // }

    /**
     * Get address balance summary across all chains for an account
     * @param {number} accountId - The account ID
     * @returns {Promise<Object>} Summary of all addresses across all chains
     */
    static async getAddressSummaryAllChains(accountId) {
        try {
            const [results] = await HDWalletDB.getAddressSummaryAllChains(accountId);
            const chainSummary = {};

            for (const row of results) {
                if (!chainSummary[row.chain]) {
                    const chainInfo = SUPPORTED_WALLETS[row.chain] || {};
                    chainSummary[row.chain] = {
                        chain: row.chain,
                        chainType: chainInfo.type,
                        nativeCurrency: chainInfo.nativeCurrency,
                        wallets: [],
                        totalBalance: 0,
                        totalAddresses: 0,
                        activeAddresses: 0,
                    };
                }

                chainSummary[row.chain].wallets.push({
                    type: row.type,
                    walletCount: parseInt(row.wallet_count),
                    addressCount: parseInt(row.address_count),
                    activeAddresses: parseInt(row.active_addresses),
                    balance: parseFloat(row.total_balance || 0).toFixed(8),
                });

                chainSummary[row.chain].totalBalance += parseFloat(row.total_balance || 0);
                chainSummary[row.chain].totalAddresses += parseInt(row.address_count);
                chainSummary[row.chain].activeAddresses += parseInt(row.active_addresses);
            }

            const chains = Object.values(chainSummary).map(chain => ({
                ...chain,
                totalBalance: chain.totalBalance.toFixed(8),
            }));

            return {
                accountId,
                summary: {
                    totalChains: chains.length,
                    totalWallets: chains.reduce((sum, c) =>
                        sum + c.wallets.reduce((s, w) => s + w.walletCount, 0), 0),
                    totalAddresses: chains.reduce((sum, c) => sum + c.totalAddresses, 0),
                    totalActiveAddresses: chains.reduce((sum, c) => sum + c.activeAddresses, 0),
                },
                chains,
            };
        } catch (error) {
            throw new Error(`Failed to get address summary: ${error.message}`);
        }
    }
    // static async getAddressSummaryAllChains(accountId) {
    //     try {
    //         const query = `
    //     SELECT
    //       hw.chain,
    //       hw.type,
    //       COUNT(DISTINCT hw.id) as wallet_count,
    //       COUNT(wa.id) as address_count,
    //       SUM(CAST(wa.balance AS DECIMAL(20,8))) as total_balance,
    //       COUNT(CASE WHEN wa.balance > 0 THEN 1 END) as active_addresses
    //     FROM hd_wallets hw
    //     LEFT JOIN wallet_addresses wa ON hw.id = wa.hd_wallet_id
    //     WHERE hw.account_id = ? AND hw.is_active = 1
    //     GROUP BY hw.chain, hw.type
    //     ORDER BY hw.chain, hw.type
    //   `;

    //         const [results] = await pool.execute(query, [accountId]);

    //         // Group by chain
    //         const chainSummary = {};

    //         for (const row of results) {
    //             if (!chainSummary[row.chain]) {
    //                 const chainInfo = SUPPORTED_WALLETS[row.chain] || {};
    //                 chainSummary[row.chain] = {
    //                     chain: row.chain,
    //                     chainType: chainInfo.type,
    //                     nativeCurrency: chainInfo.nativeCurrency,
    //                     wallets: [],
    //                     totalBalance: 0,
    //                     totalAddresses: 0,
    //                     activeAddresses: 0
    //                 };
    //             }

    //             chainSummary[row.chain].wallets.push({
    //                 type: row.type,
    //                 walletCount: parseInt(row.wallet_count),
    //                 addressCount: parseInt(row.address_count),
    //                 activeAddresses: parseInt(row.active_addresses),
    //                 balance: parseFloat(row.total_balance || 0).toFixed(8)
    //             });

    //             chainSummary[row.chain].totalBalance += parseFloat(row.total_balance || 0);
    //             chainSummary[row.chain].totalAddresses += parseInt(row.address_count);
    //             chainSummary[row.chain].activeAddresses += parseInt(row.active_addresses);
    //         }

    //         // Format final response
    //         const chains = Object.values(chainSummary).map(chain => ({
    //             ...chain,
    //             totalBalance: chain.totalBalance.toFixed(8)
    //         }));

    //         return {
    //             accountId: accountId,
    //             summary: {
    //                 totalChains: chains.length,
    //                 totalWallets: chains.reduce((sum, c) =>
    //                     sum + c.wallets.reduce((s, w) => s + w.walletCount, 0), 0),
    //                 totalAddresses: chains.reduce((sum, c) => sum + c.totalAddresses, 0),
    //                 totalActiveAddresses: chains.reduce((sum, c) => sum + c.activeAddresses, 0)
    //             },
    //             chains: chains
    //         };
    //     } catch (error) {
    //         throw new Error(`Failed to get address summary: ${error.message}`);
    //     }
    // }

    /**
     * Sync all addresses balances for an HD wallet
     * @param {number} hdWalletId - The HD wallet ID
     * @returns {Promise<Object>} Updated wallet info with fresh balances
     */
    static async syncHDWalletBalances(hdWalletId) {
        try {
            const hdWallet = await HDWalletDB.getHDWallet(hdWalletId);
            if (!hdWallet) {
                throw new Error('HD Wallet not found');
            }

            const addresses = await HDWalletDB.getWalletAddresses(hdWalletId);
            const updatedAddresses = [];

            for (const address of addresses) {
                try {
                    const balance = await this.checkBalance(address.address, hdWallet.chain);
                    updatedAddresses.push({
                        address: address.address,
                        oldBalance: address.balance,
                        newBalance: balance,
                        updated: balance !== address.balance
                    });
                } catch (error) {
                    console.error(`Failed to sync balance for ${address.address}:`, error);
                    updatedAddresses.push({
                        address: address.address,
                        error: error.message
                    });
                }
            }

            return {
                walletId: hdWalletId,
                chain: hdWallet.chain,
                syncedAt: new Date(),
                addressCount: addresses.length,
                updatedCount: updatedAddresses.filter(a => a.updated).length,
                addresses: updatedAddresses
            };
        } catch (error) {
            throw new Error(`Failed to sync HD wallet balances: ${error.message}`);
        }
    }

    // Static getter for supported wallets
    static get SUPPORTED_WALLETS() {
        return SUPPORTED_WALLETS;
    }
}

// Export both the class and the SUPPORTED_WALLETS constant
module.exports = WalletService;
module.exports.SUPPORTED_WALLETS = SUPPORTED_WALLETS;
module.exports.derivationPaths = derivationPaths;
module.exports.rpcMap = rpcMap;
