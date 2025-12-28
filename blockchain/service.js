const { loadEnv } = require('./env');
loadEnv();
const { ethers } = require('ethers');
const bitcoin = require('bitcoinjs-lib');
const { Connection, PublicKey, LAMPORTS_PER_SOL, Keypair, Transaction, SystemProgram } = require('@solana/web3.js');
const crypto = require('crypto');
const bip39 = require('bip39');
const { BIP32Factory } = require('bip32');
const ecc = require('tiny-secp256k1');
const { ECPairFactory } = require('ecpair');
const bip32 = BIP32Factory(ecc);
const ECPair = ECPairFactory(ecc);
const HDWalletDB = require('./database');
const TronWeb = require('tronweb');
const dotenv = require('dotenv');
dotenv.config(); // Load .env file if present

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
    // Tron
    tron: "https://api.trongrid.io",
    tronShasta: "https://api.shasta.trongrid.io",
    tronNile: "https://nile.trongrid.io",
};

const derivationPaths = {
    "BTC": "m/44'/0'/0'/0",
    "ETH": "m/44'/60'/0'/0",
    "SOL": "m/44'/501'/0'/0'",
    "TRX": "m/44'/195'/0'/0", // Tron derivation path
};

// Token contract addresses
const TOKEN_CONTRACTS = {
    USDT: {
        ethereum: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        sepolia: "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06",
        tron: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", // USDT TRC20 contract
    },
    // You can add more tokens here
    USDC: {
        ethereum: "0xA0b86a33E6441B6A9Ff84FC6C7Fe3C8e0aFa73DE",
        sepolia: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
        polygon: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    }
};

const SUPPORTED_WALLETS = {
    // EVM chains
    ethereum: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH', icon: '' },
    solana: { type: 'SOL', coinType: 501, nativeCurrency: 'SOL', icon: '' },
    bitcoin: { type: 'BTC', coinType: 0, nativeCurrency: 'BTC', icon: '' },
    tron: { type: 'TRX', coinType: 195, nativeCurrency: 'TRX', icon: '' },
    polygon: { type: 'EVM', coinType: 60, nativeCurrency: 'MATIC', icon: '' },
    base: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH', icon: '' },
    avalanche: { type: 'EVM', coinType: 60, nativeCurrency: 'AVAX', icon: '' },
    optimism: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH', icon: '' },
    arbitrum: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH', icon: '' },
    bsc: { type: 'EVM', coinType: 60, nativeCurrency: 'BNB', icon: '' },
    linea: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH', icon: '' },
    blast: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH', icon: '' },
    palm: { type: 'EVM', coinType: 60, nativeCurrency: 'PALM', icon: '' },
    starknet: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH', icon: '' },
    celo: { type: 'EVM', coinType: 60, nativeCurrency: 'CELO', icon: '' },
    zksync: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH', icon: '' },
    mantle: { type: 'EVM', coinType: 60, nativeCurrency: 'MNT', icon: '' },
    opbnb: { type: 'EVM', coinType: 60, nativeCurrency: 'BNB', icon: '' },
    scroll: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH', icon: '' },
    sei: { type: 'EVM', coinType: 60, nativeCurrency: 'SEI', icon: '' },
    swellchain: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH', icon: '' },
    unichain: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH', icon: '' },
    sepolia: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH', icon: '' },
    polygonAmoy: { type: 'EVM', coinType: 60, nativeCurrency: 'MATIC', icon: '' },
    baseSepolia: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH', icon: '' },
    avalancheFuji: { type: 'EVM', coinType: 60, nativeCurrency: 'AVAX', icon: '' },
    optimismSepolia: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH', icon: '' },
    arbitrumSepolia: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH', icon: '' },
    bscTestnet: { type: 'EVM', coinType: 60, nativeCurrency: 'BNB', icon: '' },
    lineaSepolia: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH', icon: '' },
    blastSepolia: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH', icon: '' },
    palmTestnet: { type: 'EVM', coinType: 60, nativeCurrency: 'PALM', icon: '' },
    starknetSepolia: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH', icon: '' },
    celoAlfajores: { type: 'EVM', coinType: 60, nativeCurrency: 'CELO', icon: '' },
    zksyncSepolia: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH', icon: '' },
    mantleSepolia: { type: 'EVM', coinType: 60, nativeCurrency: 'MNT', icon: '' },
    opbnbTestnet: { type: 'EVM', coinType: 60, nativeCurrency: 'BNB', icon: '' },
    scrollSepolia: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH', icon: '' },
    seiTestnet: { type: 'EVM', coinType: 60, nativeCurrency: 'SEI', icon: '' },
    swellchainTestnet: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH', icon: '' },
    unichainSepolia: { type: 'EVM', coinType: 60, nativeCurrency: 'ETH', icon: '' },
    bitcoinTestnet: { type: 'BTC', coinType: 1, nativeCurrency: 'BTC', icon: '' },
    solanaDevnet: { type: 'SOL', coinType: 501, nativeCurrency: 'SOL', icon: '' },
    tronShasta: { type: 'TRX', coinType: 195, nativeCurrency: 'TRX', icon: '' },
    tronNile: { type: 'TRX', coinType: 195, nativeCurrency: 'TRX', icon: '' },
    // Token aliases - these appear as separate "chains" but use Ethereum addresses
    USDT: { type: 'EVM', coinType: 60, nativeCurrency: 'USDT', icon: '', isTokenAlias: true, baseChain: 'ethereum' },
    USDC: { type: 'EVM', coinType: 60, nativeCurrency: 'USDC', icon: '', isTokenAlias: true, baseChain: 'ethereum' },
};

class WalletService {
    // 1. Create HD Wallet
    static async createHDWallet(accountId, chain = 'ethereum', type = 'spot') {
        try {
            // Generate mnemonic
            const mnemonic = bip39.generateMnemonic();

            // Create HD wallet in database
            const hdWallet = await HDWalletDB.createHDWallet(accountId, mnemonic, type);

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
    static async createAddress(hdWalletId, chain, addressIndex = null, asset = null) {
        try {
            const hdWallet = await HDWalletDB.getHDWallet(hdWalletId);
            if (!hdWallet) throw new Error('HD Wallet not found');

            // If an address already exists for this hdWallet and chain, return it (idempotent per-chain)
            const existingAddresses = await HDWalletDB.getWalletAddresses(hdWalletId);
            if (existingAddresses && existingAddresses.length > 0) {
                // Check for existing address with same chain AND asset
                const existingForChain = existingAddresses.find(a => a.chain === chain && a.asset === asset);
                if (existingForChain) {
                    return {
                        id: existingForChain.id,
                        address: existingForChain.address,
                        addressIndex: existingForChain.address_index,
                        asset: existingForChain.asset
                    };
                }
            }

            const seed = await HDWalletDB.getDecryptedSeed(hdWalletId);
            const seedBuffer = bip39.mnemonicToSeedSync(seed);

            // Use provided index or increment from current. Validate to avoid NaN in derivation paths.
            let index;
            if (addressIndex !== null) {
                index = Number(addressIndex);
                if (!Number.isFinite(index) || Number.isNaN(index)) {
                    throw new Error(`Invalid address index: ${addressIndex}`);
                }
            } else {
                const currentIndex = Number(hdWallet.address_index);
                if (!Number.isFinite(currentIndex) || Number.isNaN(currentIndex)) {
                    index = 0;
                } else {
                    index = currentIndex + 1;
                }
            }

            let address, derivationPath;
            const walletType = SUPPORTED_WALLETS[chain];

            if (!walletType) {
                throw new Error(`Unsupported chain: ${chain}`);
            }

            // Handle token aliases: if this "chain" is actually a token alias (like USDT, USDC),
            // we generate an address for the base chain (e.g., ethereum) but tag it with the asset
            let actualChainForGeneration = chain;
            let actualAsset = asset;

            if (walletType.isTokenAlias) {
                actualChainForGeneration = walletType.baseChain;
                actualAsset = chain; // The "chain" name becomes the asset (USDT, USDC)
            }

            // Get the wallet type for address generation
            const generationWalletType = SUPPORTED_WALLETS[actualChainForGeneration];

            switch (generationWalletType.type) {
                case 'EVM':
                    ({ address, derivationPath } = this.generateEVMAddress(seedBuffer, index));
                    break;
                case 'BTC':
                    ({ address, derivationPath } = this.generateBTCAddress(seedBuffer, index, actualChainForGeneration.toLowerCase().includes('testnet')));
                    break;
                case 'SOL':
                    ({ address, derivationPath } = this.generateSOLAddress(seedBuffer, index));
                    break;
                case 'TRX':
                    ({ address, derivationPath } = this.generateTRXAddress(seedBuffer, index));
                    break;
                default:
                    throw new Error(`Unknown wallet type: ${generationWalletType.type}`);
            }

            // Save to database
            const walletAddress = await HDWalletDB.createWalletAddress(
                hdWalletId,
                address,
                index,
                derivationPath,
                chain,
                'spot',
                actualAsset
            );

            // Update HD wallet's address index if we used the next sequential index
            if (addressIndex === null && index > hdWallet.address_index) {
                await HDWalletDB.updateAddressIndex(hdWalletId, index);
            }


            return {
                id: walletAddress.id,
                address: walletAddress.address,
                derivationPath: walletAddress.derivation_path,
                addressIndex: walletAddress.address_index,
                chain: walletAddress.chain,
                asset: actualAsset
            };
        } catch (error) {
            throw new Error(`Failed to create address: ${error.message}`);
        }
    }

    // Generate EVM address (Ethereum, Polygon, BSC, etc.)
    static generateEVMAddress(seedBuffer, index) {
        const derivationPath = `${derivationPaths.ETH}/${index}`;
        const hdNode = bip32.fromSeed(seedBuffer);
        const child = hdNode.derivePath(derivationPath);
        try {
            const pkBuf = Buffer.from(child.privateKey || []);
            const pkHexStr = pkBuf.length ? '0x' + pkBuf.toString('hex') : null;
            const wallet = new ethers.Wallet(pkHexStr);

            return {
                address: wallet.address,
                derivationPath
            };
        } catch (e) {
            throw e;
        }
    }

    // Generate Bitcoin address
    static generateBTCAddress(seedBuffer, index, isTestnet = false) {
        const network = isTestnet ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
        const derivationPath = `${derivationPaths.BTC}/${index}`;
        const hdNode = bip32.fromSeed(seedBuffer, network);
        const child = hdNode.derivePath(derivationPath);

        // bip32 (BIP32Factory + tiny-secp256k1) returns Uint8Array for publicKey.
        // bitcoinjs-lib expects a Buffer (which is a Node Buffer subclass of Uint8Array)
        // that also passes tiny-secp256k1's isPoint check. Wrap into Buffer to be safe.
        const pubkeyBuf = Buffer.from(child.publicKey || []);

        const { address } = bitcoin.payments.p2pkh({
            pubkey: pubkeyBuf,
            network
        });

        return {
            address,
            derivationPath
        };
    }

    // Generate Solana address
    static generateSOLAddress(seedBuffer, index) {
        // Use SLIP-0010 (ed25519) derivation to generate Solana keypairs.
        // Bip32 with tiny-secp256k1 is for secp256k1 and will produce invalid ed25519 keys.
        const derivationPath = `${derivationPaths.SOL}/${index}'`;

        // Derive an ed25519 key using SLIP-0010
        const derived = this.deriveEd25519Key(derivationPath, seedBuffer);

        // derived.key is 32 bytes private key for ed25519
        const seed = derived.key.slice(0, 32);
        const kp = Keypair.fromSeed(seed);
        const publicKey = kp.publicKey;

        return {
            address: publicKey.toString(),
            derivationPath
        };
    }

    // SLIP-0010 Ed25519 key derivation (minimal implementation)
    static deriveEd25519Key(path, seed) {
        // seed: Buffer (from bip39.mnemonicToSeedSync)
        // path: string like "m/44'/501'/0'/0'/{index}'"
        const segments = path.split('/');

        // master key
        let I = crypto.createHmac('sha512', Buffer.from('ed25519 seed')).update(seed).digest();
        let privateKey = I.slice(0, 32);
        let chainCode = I.slice(32);

        // iterate path segments after 'm'
        for (let i = 1; i < segments.length; i++) {
            const segment = segments[i];
            if (segment.length === 0) continue;

            const hardened = segment.endsWith("'");
            const indexStr = hardened ? segment.slice(0, -1) : segment;
            const index = parseInt(indexStr, 10);
            if (Number.isNaN(index)) throw new Error(`Invalid path segment: ${segment}`);

            // For ed25519 SLIP10 only hardened derivation is supported.
            const idx = (index & 0x7fffffff) | 0x80000000;

            const data = Buffer.concat([
                Buffer.from([0x00]),
                privateKey,
                Buffer.from([(idx >> 24) & 0xff, (idx >> 16) & 0xff, (idx >> 8) & 0xff, idx & 0xff])
            ]);

            I = crypto.createHmac('sha512', chainCode).update(data).digest();
            privateKey = I.slice(0, 32);
            chainCode = I.slice(32);
        }

        return { key: privateKey, chainCode };
    }

    // Generate Tron address
    static generateTRXAddress(seedBuffer, index) {
        const derivationPath = `${derivationPaths.TRX}/${index}`;
        const hdNode = bip32.fromSeed(seedBuffer);
        const child = hdNode.derivePath(derivationPath);

        try {
            const pkBuf = Buffer.from(child.privateKey || []);
            const pkHexStr = pkBuf.toString('hex');

            // Some tronweb packages export the constructor at different places depending on bundler.
            // Resolve the constructor safely.
            const TronWebClass = (TronWeb && TronWeb.default && TronWeb.default.TronWeb) || (TronWeb && TronWeb.TronWeb) || TronWeb;
            const tronInstance = new TronWebClass({ fullHost: rpcMap['tron'] || 'https://api.trongrid.io' });
            const address = tronInstance.address.fromPrivateKey(pkHexStr);

            return {
                address,
                derivationPath
            };
        } catch (e) {
            throw new Error(`Failed to generate Tron address: ${e.message}`);
        }
    }

    // Helper to create a TronWeb instance resilient to different package export shapes
    static getTronWeb(rpcUrl, options = {}) {
        const TronWebClass = (TronWeb && TronWeb.default && TronWeb.default.TronWeb) || (TronWeb && TronWeb.TronWeb) || TronWeb;
        const cfg = Object.assign({ fullHost: rpcUrl || rpcMap['tron'] || 'https://api.trongrid.io' }, options || {});
        return new TronWebClass(cfg);
    }

    // 3. Check balance of wallet (supports both native currency and tokens)
    static async checkBalance(walletAddress, chain, tokenSymbol = null) {
        try {
            const walletType = SUPPORTED_WALLETS[chain];
            if (!walletType) throw new Error(`Unsupported chain: ${chain}`);

            let balance = 0;

            if (tokenSymbol) {
                // Check token balance
                balance = await this.getTokenBalance(walletAddress, chain, tokenSymbol);
            } else {
                // Check native currency balance
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
                    case 'TRX':
                        balance = await this.getTRXBalance(walletAddress, chain);
                        break;
                }
            }

            // Update balance in database
            const dbWalletAddress = await HDWalletDB.getWalletAddressByString(walletAddress);
            if (dbWalletAddress) {
                if (tokenSymbol) {
                    await HDWalletDB.updateTokenBalance(dbWalletAddress.id, balance, tokenSymbol);
                } else {
                    await HDWalletDB.updateWalletBalance(dbWalletAddress.id, balance);
                }
            }

            return balance;
        } catch (error) {
            throw new Error(`Failed to check balance: ${error.message}`);
        }
    }

    // Get token balance (ERC20/TRC20)
    static async getTokenBalance(address, chain, tokenSymbol) {
        const contractAddress = TOKEN_CONTRACTS[tokenSymbol]?.[chain];
        if (!contractAddress) {
            throw new Error(`Token ${tokenSymbol} not supported on ${chain}`);
        }

        const walletType = SUPPORTED_WALLETS[chain];

        switch (walletType.type) {
            case 'EVM':
                return await this.getERC20Balance(address, contractAddress, chain);
            case 'TRX':
                return await this.getTRC20Balance(address, contractAddress, chain);
            default:
                throw new Error(`Token balance not supported for ${walletType.type}`);
        }
    }

    // Get ERC20 token balance
    static async getERC20Balance(address, contractAddress, chain) {
        const rpcUrl = rpcMap[chain];
        if (!rpcUrl) throw new Error(`RPC URL not found for chain: ${chain}`);

        const provider = new ethers.JsonRpcProvider(rpcUrl);

        // ERC20 ABI for balanceOf function
        const erc20Abi = [
            "function balanceOf(address owner) view returns (uint256)",
            "function decimals() view returns (uint8)"
        ];

        const contract = new ethers.Contract(contractAddress, erc20Abi, provider);

        try {
            const [balance, decimals] = await Promise.all([
                contract.balanceOf(address),
                contract.decimals()
            ]);

            return ethers.formatUnits(balance, decimals);
        } catch (error) {
            throw new Error(`Failed to get ERC20 balance: ${error.message}`);
        }
    }

    // Get TRC20 token balance (USDT on Tron)
    static async getTRC20Balance(address, contractAddress, chain) {
        const rpcUrl = rpcMap[chain];
        const tronWeb = this.getTronWeb(rpcUrl);

        try {
            const contract = await tronWeb.contract().at(contractAddress);
            const balance = await contract.balanceOf(address).call();
            const decimals = await contract.decimals().call();

            // Convert balance considering decimals
            const balanceFormatted = balance / Math.pow(10, decimals);
            return balanceFormatted.toString();
        } catch (error) {
            throw new Error(`Failed to get TRC20 balance: ${error.message}`);
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
        const res = await fetch(`${baseUrl}/address/${address}`);

        // If Blockstream returns JSON (normal), parse it. Otherwise handle HTML/plain-text errors.
        const contentType = res.headers.get('content-type') || '';

        let data;
        if (contentType.includes('application/json')) {
            data = await res.json();
        } else {
            // Some endpoints return plain text or HTML when address is not found or when using mainnet address
            // against the testnet endpoint. Read text and try to detect common messages.
            const text = await res.text();

            // Common Blockstream message when checking mainnet address on testnet: contains 'Address on'
            if (/Address on/i.test(text) || /not found/i.test(text) || /No such address/i.test(text) || res.status === 404) {
                // Treat as zero balance rather than crashing the whole process
                return '0';
            }

            // If it's HTML (starts with <) return 0 for safety, else raise a clearer error
            if (text && text.trim().startsWith('<')) {
                return '0';
            }

            throw new Error(`Unexpected non-JSON response from ${baseUrl}/address: ${text.slice(0, 200)}`);
        }

        // Convert satoshis to BTC
        return (data.chain_stats && data.chain_stats.funded_txo_sum ? data.chain_stats.funded_txo_sum / 100000000 : 0).toString();
    }

    // Get Solana balance
    static async getSOLBalance(address, chain) {
        const rpcUrl = rpcMap[chain];
        const connection = new Connection(rpcUrl);
        const publicKey = new PublicKey(address);
        const balance = await connection.getBalance(publicKey);

        return (balance / LAMPORTS_PER_SOL).toString();
    }

    // Get Tron balance
    static async getTRXBalance(address, chain) {
        const rpcUrl = rpcMap[chain];
        const tronWeb = this.getTronWeb(rpcUrl);

        try {
            const balance = await tronWeb.trx.getBalance(address);
            // Convert sun to TRX (1 TRX = 1,000,000 sun)
            return (balance / 1000000).toString();
        } catch (error) {
            throw new Error(`Failed to get TRX balance: ${error.message}`);
        }
    }

    // 4. Transfer asset to master wallet (withdrawal simulation)
    // Enhanced transferToMaster with actual blockchain transfers - SWEEP MODE
    static async transferToMaster(fromWalletId, toMasterAddress, chain, assetId = null) {
        try {
            // Get wallet details
            const hdWallet = await HDWalletDB.getHDWallet(fromWalletId);
            if (!hdWallet) throw new Error('HD Wallet not found');

            const addresses = await HDWalletDB.getWalletAddresses(fromWalletId);

            // Find address with highest balance
            let fromAddress;
            if (assetId) {
                // For tokens, check token balance
                fromAddress = addresses.sort((a, b) => parseFloat(b.token_balance || 0) - parseFloat(a.token_balance || 0))[0];
            } else {
                // === AUTOMATIC TOKEN SWEEP LOGIC ===
                // If assetId is null (Native Sweep), check if we have any tokens on this chain and sweep them first.
                // We do this by finding all addresses on this chain with a token_balance > 0.
                const tokenAddresses = addresses.filter(a => a.chain === chain && a.asset && parseFloat(a.token_balance) > 0);

                for (const tokenAddr of tokenAddresses) {
                    console.log(`[Auto-Sweep] Found ${tokenAddr.asset} (${tokenAddr.token_balance}). Sweeping first...`);
                    try {
                        // Recursively call transferToMaster for the token
                        await this.transferToMaster(fromWalletId, toMasterAddress, chain, tokenAddr.asset);
                    } catch (e) {
                        console.error(`[Auto-Sweep] Failed to sweep ${tokenAddr.asset}: ${e.message}`);
                        // Continue to sweep other tokens or native currency even if one fails
                    }
                }

                // For native currency, check native balance
                fromAddress = addresses.sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance))[0];
            }

            if (!fromAddress || (assetId ? parseFloat(fromAddress.token_balance || 0) <= 0 : parseFloat(fromAddress.balance) <= 0)) {
                throw new Error('Insufficient balance in wallet addresses');
            }

            // Calculate max transferable amount (Sweep)
            let amount;
            try {
                amount = await this.calculateMaxTransferableAmount(fromAddress.address, chain, assetId, toMasterAddress);
            } catch (calcError) {
                throw new Error(`Failed to calculate max transferable amount: ${calcError.message}`);
            }

            if (parseFloat(amount) <= 0) {
                throw new Error('Calculated transfer amount is zero or negative (insufficient for gas)');
            }

            // Get private key for signing
            const seed = await HDWalletDB.getDecryptedSeed(fromWalletId);
            const seedBuffer = bip39.mnemonicToSeedSync(seed);
            const privateKey = await this.getPrivateKeyForAddress(seedBuffer, fromAddress.derivation_path, chain);

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

            // Execute actual transfer on blockchain
            const walletType = SUPPORTED_WALLETS[chain];
            let txHash, actualGasFee;

            try {
                switch (walletType.type) {
                    case 'EVM':
                        ({ txHash, actualGasFee } = await this.executeEVMTransfer(
                            privateKey, fromAddress.address, toMasterAddress, amount, chain, assetId
                        ));
                        break;
                    case 'BTC':
                        ({ txHash, actualGasFee } = await this.executeBTCTransfer(
                            privateKey, fromAddress.address, toMasterAddress, amount, chain
                        ));
                        break;
                    case 'SOL':
                        ({ txHash, actualGasFee } = await this.executeSOLTransfer(
                            privateKey, fromAddress.address, toMasterAddress, amount, chain
                        ));
                        break;
                    case 'TRX':
                        ({ txHash, actualGasFee } = await this.executeTRXTransfer(
                            privateKey, fromAddress.address, toMasterAddress, amount, chain, assetId
                        ));
                        break;
                    default:
                        throw new Error(`Unsupported wallet type: ${walletType.type}`);
                }

                // Update transaction as successful
                await HDWalletDB.updateTransactionStatus(
                    transaction.id,
                    'completed',
                    txHash,
                    actualGasFee,
                    new Date()
                );

                // Update wallet balance (subtract amount + fees)
                if (assetId) {
                    // Update token balance
                    const newTokenBalance = parseFloat(fromAddress.token_balance || 0) - parseFloat(amount);
                    await HDWalletDB.updateTokenBalance(fromAddress.id, newTokenBalance.toString(), assetId);

                    // Update native balance for gas fees
                    const newNativeBalance = parseFloat(fromAddress.balance) - parseFloat(actualGasFee);
                    await HDWalletDB.updateWalletBalance(fromAddress.id, newNativeBalance.toString());
                } else {
                    // Update native balance (amount + fees) aka set to near zero.
                    // For native sweep, balance should effectively be zero, but we might differ slightly due to dust.
                    // We calculate it: oldBalance - amount - gas.
                    const newBalance = parseFloat(fromAddress.balance) - parseFloat(amount) - parseFloat(actualGasFee);
                    await HDWalletDB.updateWalletBalance(fromAddress.id, newBalance.toString());
                }

                return {
                    transactionId: transaction.id,
                    txHash: txHash,
                    fromAddress: fromAddress.address,
                    toAddress: toMasterAddress,
                    amount: amount,
                    gasFee: actualGasFee,
                    status: 'completed',
                    assetId: assetId,
                    blockchainUrl: this.getBlockchainExplorerUrl(chain, txHash)
                };

            } catch (blockchainError) {
                // Update transaction as failed
                await HDWalletDB.updateTransactionStatus(
                    transaction.id,
                    'failed',
                    null,
                    null,
                    new Date(),
                    blockchainError.message
                );

                throw new Error(`Blockchain transfer failed: ${blockchainError.message}`);
            }

        } catch (error) {
            throw new Error(`Transfer failed: ${error.message}`);
        }
    }

    // Calculate Max Transferable Amount (Sweep)
    static async calculateMaxTransferableAmount(address, chain, assetId, toAddress) {
        const walletType = SUPPORTED_WALLETS[chain];

        // 1. Get Balance
        let balance;
        if (assetId) {
            balance = await this.getTokenBalance(address, chain, assetId);
        } else {
            switch (walletType.type) {
                case 'EVM': balance = await this.getEVMBalance(address, chain); break;
                case 'BTC': balance = await this.getBTCBalance(address, chain); break;
                case 'SOL': balance = await this.getSOLBalance(address, chain); break;
                case 'TRX': balance = await this.getTRXBalance(address, chain); break;
            }
        }

        if (parseFloat(balance) === 0) return '0';

        // 2. Estimate Gas and Deduct
        if (assetId) {
            // For tokens, max transfer is the full token balance. 
            // Assumption: Native balance is sufficient for gas. We could check native balance here too.
            return balance;
        }

        // For Native assets, deduct gas
        try {
            switch (walletType.type) {
                case 'EVM': {
                    const rpcUrl = rpcMap[chain];
                    const provider = new ethers.JsonRpcProvider(rpcUrl);
                    const feeData = await provider.getFeeData();
                    // Estimate gas limit for a simple transfer (21000 usually)
                    const gasLimit = 21000n;
                    const gasCost = gasLimit * (feeData.gasPrice || 1000000000n); // fallback 1 gwei
                    const gasCostEth = ethers.formatEther(gasCost);

                    const maxAmount = parseFloat(balance) - parseFloat(gasCostEth);
                    return maxAmount > 0 ? maxAmount.toString() : '0';
                }
                case 'BTC': {
                    // Approximate BTC fee calculation or fetch UTXOs to be precise
                    // Simple estimation: 1 input, 2 outputs (recipient + change... wait, sweep means 1 output?)
                    // Sweep = 1 input (consolidated? no) -> All inputs -> 1 output.
                    // For improved accuracy, we really should fetch UTXOs.
                    // Using a safe margin for now: 0.0001 BTC if we don't fetch UTXOs.
                    const estimatedFee = 0.0001; // can be high/low depending on UTXO count
                    const maxAmount = parseFloat(balance) - estimatedFee;
                    return maxAmount > 0 ? maxAmount.toString() : '0';
                }
                case 'SOL': {
                    const fee = 0.000005; // Standard SOL fee
                    const maxAmount = parseFloat(balance) - fee;
                    return maxAmount > 0 ? maxAmount.toString() : '0';
                }
                case 'TRX': {
                    const fee = 1.1; // ~1.1 TRX for transfer
                    const maxAmount = parseFloat(balance) - fee;
                    return maxAmount > 0 ? maxAmount.toString() : '0';
                }
                default:
                    return balance; // Should not happen
            }
        } catch (e) {
            console.error("Error calculating max amount:", e);
            // Fallback: subtract a safe margin? Or throw?
            // Throwing ensures we don't fail properly later.
            throw e;
        }
    }

    // Get private key for a specific address
    static async getPrivateKeyForAddress(seedBuffer, derivationPath, chain) {
        const walletType = SUPPORTED_WALLETS[chain];
        const hdNode = bip32.fromSeed(seedBuffer);
        const child = hdNode.derivePath(derivationPath);

        switch (walletType.type) {
            case 'EVM':
            case 'TRX':
                return child.privateKey;
            case 'BTC':
                const network = chain.includes('testnet') ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
                return child.privateKey;
            case 'SOL':
                return child.privateKey.slice(0, 32); // Solana uses 32-byte keys
            default:
                throw new Error(`Unsupported wallet type: ${walletType.type}`);
        }
    }

    // Execute EVM transfer (Ethereum, Polygon, BSC, etc.)
    static async executeEVMTransfer(privateKey, fromAddress, toAddress, amount, chain, assetId = null) {
        const rpcUrl = rpcMap[chain];
        if (!rpcUrl) throw new Error(`RPC URL not found for chain: ${chain}`);

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(privateKey, provider);

        let tx, receipt;

        try {
            if (assetId && TOKEN_CONTRACTS[assetId] && TOKEN_CONTRACTS[assetId][chain]) {
                // Token transfer
                const contractAddress = TOKEN_CONTRACTS[assetId][chain];
                const erc20Abi = [
                    "function transfer(address to, uint256 amount) returns (bool)",
                    "function decimals() view returns (uint8)"
                ];

                const contract = new ethers.Contract(contractAddress, erc20Abi, wallet);
                const decimals = await contract.decimals();
                const tokenAmount = ethers.parseUnits(amount, decimals);

                // Estimate gas
                const gasLimit = await contract.transfer.estimateGas(toAddress, tokenAmount);
                const gasPrice = await provider.getFeeData();

                // Send token transfer transaction
                tx = await contract.transfer(toAddress, tokenAmount, {
                    gasLimit: gasLimit,
                    gasPrice: gasPrice.gasPrice
                });

            } else {
                // Native currency transfer
                const value = ethers.parseEther(amount);

                // Estimate gas
                const gasLimit = await provider.estimateGas({
                    to: toAddress,
                    value: value
                });
                const gasPrice = await provider.getFeeData();

                // Send native transfer transaction
                tx = await wallet.sendTransaction({
                    to: toAddress,
                    value: value,
                    gasLimit: gasLimit,
                    gasPrice: gasPrice.gasPrice
                });
            }

            // Wait for confirmation
            receipt = await tx.wait();

            if (receipt.status !== 1) {
                throw new Error(`Transaction failed with status: ${receipt.status}`);
            }

            // Calculate actual gas fee
            const actualGasFee = ethers.formatEther(receipt.gasUsed * receipt.gasPrice);

            return {
                txHash: receipt.hash,
                actualGasFee: actualGasFee
            };

        } catch (error) {
            throw new Error(`EVM transfer failed: ${error.message}`);
        }
    }

    // Execute Bitcoin transfer
    static async executeBTCTransfer(privateKey, fromAddress, toAddress, amount, chain) {
        const network = chain.includes('testnet') ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
        const keyPair = ECPair.fromPrivateKey(privateKey, { network });
        const baseUrl = rpcMap[chain];

        try {
            // Get UTXOs for the address
            const utxosResponse = await fetch(`${baseUrl}/address/${fromAddress}/utxo`);
            const utxos = await utxosResponse.json();

            if (!utxos || utxos.length === 0) {
                throw new Error('No UTXOs available for spending');
            }

            // Create transaction
            const psbt = new bitcoin.Psbt({ network });
            let totalInput = 0;

            // Add inputs
            for (const utxo of utxos) {
                const txHex = await fetch(`${baseUrl}/tx/${utxo.txid}/hex`);
                const rawTx = await txHex.text();

                psbt.addInput({
                    hash: utxo.txid,
                    index: utxo.vout,
                    nonWitnessUtxo: Buffer.from(rawTx, 'hex')
                });

                totalInput += utxo.value;
            }

            const amountSatoshis = Math.floor(parseFloat(amount) * 100000000);
            const feeRate = 10; // satoshis per byte (adjust based on network conditions)
            const estimatedFee = 250 * feeRate; // rough estimate
            const change = totalInput - amountSatoshis - estimatedFee;

            // Add output to recipient
            psbt.addOutput({
                address: toAddress,
                value: amountSatoshis
            });

            // Add change output if needed
            if (change > 546) { // dust limit
                psbt.addOutput({
                    address: fromAddress,
                    value: change
                });
            }

            // Sign all inputs
            for (let i = 0; i < utxos.length; i++) {
                psbt.signInput(i, keyPair);
            }

            // Finalize and extract transaction
            psbt.finalizeAllInputs();
            const tx = psbt.extractTransaction();
            const txHex = tx.toHex();

            // Broadcast transaction
            const broadcastResponse = await fetch(`${baseUrl}/tx`, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: txHex
            });

            if (!broadcastResponse.ok) {
                const errorText = await broadcastResponse.text();
                throw new Error(`Broadcast failed: ${errorText}`);
            }

            const txId = await broadcastResponse.text();
            const actualGasFee = (estimatedFee / 100000000).toString();

            return {
                txHash: txId,
                actualGasFee: actualGasFee
            };

        } catch (error) {
            throw new Error(`Bitcoin transfer failed: ${error.message}`);
        }
    }

    // Execute Solana transfer
    static async executeSOLTransfer(privateKey, fromAddress, toAddress, amount, chain) {
        const rpcUrl = rpcMap[chain];
        const connection = new Connection(rpcUrl);

        try {
            // Create keypair from private key
            const fromKeypair = Keypair.fromSecretKey(privateKey);
            const toPubkey = new PublicKey(toAddress);
            const lamports = parseFloat(amount) * LAMPORTS_PER_SOL;

            // Create transaction
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: fromKeypair.publicKey,
                    toPubkey: toPubkey,
                    lamports: lamports
                })
            );

            // Get recent blockhash
            const { blockhash } = await connection.getRecentBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = fromKeypair.publicKey;

            // Sign transaction
            transaction.sign(fromKeypair);

            // Send transaction
            const signature = await connection.sendRawTransaction(transaction.serialize());

            // Confirm transaction
            await connection.confirmTransaction(signature);

            // Get transaction details for fee calculation
            const txDetails = await connection.getTransaction(signature);
            const actualGasFee = (txDetails.meta.fee / LAMPORTS_PER_SOL).toString();

            return {
                txHash: signature,
                actualGasFee: actualGasFee
            };

        } catch (error) {
            throw new Error(`Solana transfer failed: ${error.message}`);
        }
    }

    // Execute Tron transfer (TRX and TRC20 tokens)
    static async executeTRXTransfer(privateKey, fromAddress, toAddress, amount, chain, assetId = null) {
        const rpcUrl = rpcMap[chain];
        const tronWeb = this.getTronWeb(rpcUrl, { privateKey: privateKey.toString('hex') });

        try {
            let tx, result;

            if (assetId && TOKEN_CONTRACTS[assetId] && TOKEN_CONTRACTS[assetId][chain]) {
                // TRC20 token transfer
                const contractAddress = TOKEN_CONTRACTS[assetId][chain];
                const contract = await tronWeb.contract().at(contractAddress);
                const decimals = await contract.decimals().call();
                const tokenAmount = parseFloat(amount) * Math.pow(10, decimals);

                // Build token transfer transaction
                const txObject = await contract.transfer(toAddress, tokenAmount).send({
                    feeLimit: 100000000, // 100 TRX fee limit
                    from: fromAddress
                });

                result = txObject;

            } else {
                // Native TRX transfer
                const trxAmount = parseFloat(amount) * 1000000; // Convert TRX to sun

                // Build TRX transfer transaction
                const txObject = await tronWeb.transactionBuilder.sendTrx(
                    toAddress,
                    trxAmount,
                    fromAddress
                );

                // Sign transaction
                const signedTx = await tronWeb.trx.sign(txObject);

                // Broadcast transaction
                result = await tronWeb.trx.sendRawTransaction(signedTx);
            }

            if (!result.result || !result.txid) {
                throw new Error(`Transaction failed: ${JSON.stringify(result)}`);
            }

            // Wait for confirmation (optional, you might want to implement polling)
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Estimate gas fee (this is approximate for Tron)
            const actualGasFee = assetId ? '5' : '1.1'; // TRX

            return {
                txHash: result.txid,
                actualGasFee: actualGasFee
            };

        } catch (error) {
            throw new Error(`Tron transfer failed: ${error.message}`);
        }
    }

    // Get blockchain explorer URL
    static getBlockchainExplorerUrl(chain, txHash) {
        const explorers = {
            ethereum: `https://etherscan.io/tx/${txHash}`,
            sepolia: `https://sepolia.etherscan.io/tx/${txHash}`,
            polygon: `https://polygonscan.com/tx/${txHash}`,
            bsc: `https://bscscan.com/tx/${txHash}`,
            bitcoin: `https://blockstream.info/tx/${txHash}`,
            bitcoinTestnet: `https://blockstream.info/testnet/tx/${txHash}`,
            solana: `https://explorer.solana.com/tx/${txHash}`,
            solanaDevnet: `https://explorer.solana.com/tx/${txHash}?cluster=devnet`,
            tron: `https://tronscan.org/#/transaction/${txHash}`,
            tronShasta: `https://shasta.tronscan.org/#/transaction/${txHash}`
        };

        return explorers[chain] || null;
    }

    // Enhanced balance check with retry logic
    static async checkBalanceWithRetry(address, chain, tokenSymbol = null, maxRetries = 3) {
        let lastError;

        for (let i = 0; i < maxRetries; i++) {
            try {
                return await this.checkBalance(address, chain, tokenSymbol);
            } catch (error) {
                lastError = error;
                if (i < maxRetries - 1) {
                    // Wait before retry (exponential backoff)
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
                }
            }
        }

        throw lastError;
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

    // Get mnemonic for HD wallet (admin only - for recovery)
    // static async getMnemonic(hdWalletId) {
    //     try {
    //         const hdWallet = await HDWalletDB.getHDWallet(hdWalletId);
    //         if (!hdWallet) {
    //             throw new Error('HD Wallet not found');
    //         }

    //         // Decrypt the  mnemonic
    //         const mnemonic = HDWalletDB.decryptMnemonic(hdWallet.encrypted_seed);

    //         return {
    //             success: true,
    //             mnemonic: mnemonic,
    //             walletId: hdWallet.id
    //         };
    //     } catch (error) {
    //         throw new Error(`Failed to retrieve mnemonic: ${error.message}`);
    //     }
    // }

    /**
     * Return a list of supported chains and basic metadata for each
     * @returns {Promise<Array<Object>>}
     */
    static async getSupportedChains() {
        try {
            const chains = Object.keys(SUPPORTED_WALLETS).filter(key => {
                if (process.env.APP_ENV === 'production') {
                    const info = SUPPORTED_WALLETS[key];
                    const isTestnet = key.toLowerCase().includes('testnet') ||
                        key.toLowerCase().includes('devnet') ||
                        key.toLowerCase().includes('sepolia') ||
                        key.toLowerCase().includes('fuji') ||
                        key.toLowerCase().includes('shasta') ||
                        key.toLowerCase().includes('nile') ||
                        key.toLowerCase().includes('alfajores'); // Add other testnet identifiers as needed
                    return !isTestnet;
                }
                return true;
            }).map((key) => {
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
                    // Supported tokens for this chain
                    supportedTokens: this.getSupportedTokensForChain(key),
                };
            });

            return chains;
        } catch (error) {
            throw new Error(`Failed to get supported chains: ${error.message}`);
        }
    }

    /**
     * Get supported tokens for a specific chain
     * @param {string} chain - The chain identifier
     * @returns {Array} Array of supported token symbols
     */
    static getSupportedTokensForChain(chain) {
        const tokens = [];

        for (const [tokenSymbol, contracts] of Object.entries(TOKEN_CONTRACTS)) {
            if (contracts[chain]) {
                tokens.push({
                    symbol: tokenSymbol,
                    contract: contracts[chain],
                    name: tokenSymbol === 'USDT' ? 'Tether USD' :
                        tokenSymbol === 'USDC' ? 'USD Coin' : tokenSymbol
                });
            }
        }

        return tokens;
    }

    /**
     * Check token balance for a specific wallet address
     * @param {string} walletAddress - The wallet address
     * @param {string} chain - The blockchain chain
     * @param {string} tokenSymbol - Token symbol (e.g., 'USDT')
     * @returns {Promise<string>} Token balance
     */
    static async checkTokenBalance(walletAddress, chain, tokenSymbol) {
        return await this.checkBalance(walletAddress, chain, tokenSymbol);
    }

    /**
     * Fetch current crypto price in USD
     * @param {string} symbol - The symbol to fetch (e.g., BTC, ETH, USDT)
     * @returns {Promise<number>} Price in USD
     */
    static async fetchCryptoPrice(symbol) {
        // Map symbols to CoinGecko IDs
        const map = {
            'BTC': 'bitcoin',
            'ETH': 'ethereum',
            'SOL': 'solana',
            'TRX': 'tron',
            'USDT': 'tether',
            'USDC': 'usd-coin',
            'BNB': 'binancecoin',
            'MATIC': 'matic-network',
            'AVAX': 'avalanche-2',
            // Add more as needed
        };

        const id = map[symbol.toUpperCase()];
        if (!id) {
            // Fallback for stablecoins if they invoke this with unknown symbol but we know it's stable-ish
            if (symbol.toUpperCase().includes('USD')) return 1.0;
            throw new Error(`Unknown symbol definition for price fetch: ${symbol}`);
        }

        try {
            const url = `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`CoinGecko API error: ${response.statusText}`);
            const data = await response.json();

            if (data[id] && data[id].usd) {
                return parseFloat(data[id].usd);
            }
            throw new Error('Price data missing in response');
        } catch (error) {
            console.error(`Failed to fetch price for ${symbol}:`, error.message);
            // Fallback? Or throw? Throwing is safer than crediting wrong amount.
            // For stablecoins, we might fallback to 1.
            if (symbol.toUpperCase() === 'USDT' || symbol.toUpperCase() === 'USDC') return 1.0;
            throw error;
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
                    updatedAt: addr.updated_at,
                    asset: hdWallet.chain // Assuming 'asset' refers to the chain's native asset
                })),
                createdAt: hdWallet.created_at,
                updatedAt: hdWallet.updated_at,
                isActive: hdWallet.is_active
            };
        } catch (error) {
            throw new Error(`Failed to get addresses for HD wallet: ${error.message}`);
        }
    }

    // Get mnemonic for HD wallet (admin/emergency use only)
    static async getMnemonic(hdWalletId) {
        try {
            const mnemonic = await HDWalletDB.getDecryptedSeed(hdWalletId);
            return {
                success: true,
                mnemonic: mnemonic
            };
        } catch (error) {
            throw new Error(`Failed to retrieve mnemonic: ${error.message}`);
        }
    }

    // Static getter for supported wallets
    static get SUPPORTED_WALLETS() {
        return SUPPORTED_WALLETS;
    }
}

// Export both the class and helpers
module.exports = WalletService;
module.exports.SUPPORTED_WALLETS = SUPPORTED_WALLETS;
module.exports.derivationPaths = derivationPaths;
module.exports.rpcMap = rpcMap;
module.exports.TOKEN_CONTRACTS = TOKEN_CONTRACTS;
