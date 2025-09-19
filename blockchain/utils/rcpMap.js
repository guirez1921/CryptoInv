const rpcMap = {
    // --- Ethereum ---
    ethereum: "https://mainnet.infura.io/v3/17405663a8354f2daef2178409d0fc84",
    ethereumHoodi: "https://hoodi.infura.io/v3/17405663a8354f2daef2178409d0fc84",
    sepolia: "https://sepolia.infura.io/v3/17405663a8354f2daef2178409d0fc84",

    // --- Linea ---
    linea: "https://linea-mainnet.infura.io/v3/17405663a8354f2daef2178409d0fc84",
    lineaSepolia: "https://linea-sepolia.infura.io/v3/17405663a8354f2daef2178409d0fc84",

    // --- Polygon ---
    polygon: "https://polygon-mainnet.infura.io/v3/17405663a8354f2daef2178409d0fc84",
    polygonAmoy: "https://polygon-amoy.infura.io/v3/17405663a8354f2daef2178409d0fc84",

    // --- Base ---
    base: "https://base-mainnet.infura.io/v3/17405663a8354f2daef2178409d0fc84",
    baseSepolia: "https://base-sepolia.infura.io/v3/17405663a8354f2daef2178409d0fc84",

    // --- Blast ---
    blast: "https://blast-mainnet.infura.io/v3/17405663a8354f2daef2178409d0fc84",
    blastSepolia: "https://blast-sepolia.infura.io/v3/17405663a8354f2daef2178409d0fc84",

    // --- Optimism ---
    optimism: "https://optimism-mainnet.infura.io/v3/17405663a8354f2daef2178409d0fc84",
    optimismSepolia: "https://optimism-sepolia.infura.io/v3/17405663a8354f2daef2178409d0fc84",

    // --- Arbitrum ---
    arbitrum: "https://arbitrum-mainnet.infura.io/v3/17405663a8354f2daef2178409d0fc84",
    arbitrumSepolia: "https://arbitrum-sepolia.infura.io/v3/17405663a8354f2daef2178409d0fc84",

    // --- Palm ---
    palm: "https://palm-mainnet.infura.io/v3/17405663a8354f2daef2178409d0fc84",
    palmTestnet: "https://palm-testnet.infura.io/v3/17405663a8354f2daef2178409d0fc84",

    // --- Avalanche ---
    avalanche: "https://avalanche-mainnet.infura.io/v3/17405663a8354f2daef2178409d0fc84",
    avalancheFuji: "https://avalanche-fuji.infura.io/v3/17405663a8354f2daef2178409d0fc84",

    // --- Starknet ---
    starknet: "https://starknet-mainnet.infura.io/v3/17405663a8354f2daef2178409d0fc84",
    starknetSepolia: "https://starknet-sepolia.infura.io/v3/17405663a8354f2daef2178409d0fc84",

    // --- Celo ---
    celo: "https://celo-mainnet.infura.io/v3/17405663a8354f2daef2178409d0fc84",
    celoAlfajores: "https://celo-alfajores.infura.io/v3/17405663a8354f2daef2178409d0fc84",

    // --- ZKsync ---
    zksync: "https://zksync-mainnet.infura.io/v3/17405663a8354f2daef2178409d0fc84",
    zksyncSepolia: "https://zksync-sepolia.infura.io/v3/17405663a8354f2daef2178409d0fc84",

    // --- BSC ---
    bsc: "https://bsc-mainnet.infura.io/v3/17405663a8354f2daef2178409d0fc84",
    bscTestnet: "https://bsc-testnet.infura.io/v3/17405663a8354f2daef2178409d0fc84",

    // --- Mantle ---
    mantle: "https://mantle-mainnet.infura.io/v3/17405663a8354f2daef2178409d0fc84",
    mantleSepolia: "https://mantle-sepolia.infura.io/v3/17405663a8354f2daef2178409d0fc84",

    // --- opBNB ---
    opbnb: "https://opbnb-mainnet.infura.io/v3/17405663a8354f2daef2178409d0fc84",
    opbnbTestnet: "https://opbnb-testnet.infura.io/v3/17405663a8354f2daef2178409d0fc84",

    // --- Scroll ---
    scroll: "https://scroll-mainnet.infura.io/v3/17405663a8354f2daef2178409d0fc84",
    scrollSepolia: "https://scroll-sepolia.infura.io/v3/17405663a8354f2daef2178409d0fc84",

    // --- Sei ---
    sei: "https://sei-mainnet.infura.io/v3/17405663a8354f2daef2178409d0fc84",
    seiTestnet: "https://sei-testnet.infura.io/v3/17405663a8354f2daef2178409d0fc84",

    // --- Swellchain ---
    swellchain: "https://swellchain-mainnet.infura.io/v3/17405663a8354f2daef2178409d0fc84",
    swellchainTestnet: "https://swellchain-testnet.infura.io/v3/17405663a8354f2daef2178409d0fc84",

    // --- Unichain ---
    unichain: "https://unichain-mainnet.infura.io/v3/17405663a8354f2daef2178409d0fc84",
    unichainSepolia: "https://unichain-sepolia.infura.io/v3/17405663a8354f2daef2178409d0fc84",
};

// Unified CHAIN_CONFIG with all properties from both configs
const CHAIN_CONFIG = {
  // EVM Chains
  ethereum: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
    minDeposit: 0.01,
    withdrawalFee: 0.005,
    chainId: 1,
    coinType: 60,
    chainType: 'evm',
    derivationPath: "m/44'/60'/0'/0/",
    image: "/images/ethereum.png"
  },
  polygon: {
    name: "Polygon",
    symbol: "MATIC",
    decimals: 18,
    minDeposit: 1,
    withdrawalFee: 0.1,
    chainId: 137,
    coinType: 60,
    chainType: 'evm',
    derivationPath: "m/44'/60'/1'/0/",
    image: "/images/polygon.png"
  },
  bsc: {
    name: "BSC",
    symbol: "BNB",
    decimals: 18,
    minDeposit: 0.01,
    withdrawalFee: 0.001,
    chainId: 56,
    coinType: 60, // BSC uses same coin type as ETH
    chainType: 'evm',
    derivationPath: "m/44'/60'/2'/0/",
    image: "/images/bnb.png"
  },
  arbitrum: {
    name: "Arbitrum",
    symbol: "ETH",
    decimals: 18,
    minDeposit: 0.01,
    withdrawalFee: 0.0005,
    chainId: 42161,
    coinType: 60,
    chainType: 'evm',
    derivationPath: "m/44'/60'/3'/0/",
    image: "/images/arbitrum.png"
  },
  optimism: {
    name: "Optimism",
    symbol: "ETH",
    decimals: 18,
    minDeposit: 0.01,
    withdrawalFee: 0.0005,
    chainId: 10,
    coinType: 60,
    chainType: 'evm',
    derivationPath: "m/44'/60'/4'/0/",
    image: "/images/optimism-ethereum.png"
  },
  base: {
    name: "Base",
    symbol: "ETH",
    decimals: 18,
    minDeposit: 0.01,
    withdrawalFee: 0.0005,
    chainId: 8453,
    coinType: 60,
    chainType: 'evm',
    derivationPath: "m/44'/60'/5'/0/",
    image: "/images/rsz_base.webp"
  },
  avalanche: {
    name: "Avalanche",
    symbol: "AVAX",
    decimals: 18,
    minDeposit: 0.1,
    withdrawalFee: 0.01,
    chainId: 43114,
    coinType: 60,
    chainType: 'evm',
    derivationPath: "m/44'/60'/6'/0/",
    image: "/images/avalanche.png"
  },
  // Solana
  solana: {
    name: "Solana",
    symbol: "SOL",
    decimals: 9,
    minDeposit: 0.01,
    withdrawalFee: 0.001,
    chainId: null,
    coinType: 501,
    chainType: 'solana',
    derivationPath: "m/44'/501'/7'/0'",
    image: "/images/solana.png"
  },
  // Bitcoin
  bitcoin: {
    name: "Bitcoin",
    symbol: "BTC",
    decimals: 8,
    minDeposit: 0.0001,
    withdrawalFee: 0.0005,
    chainId: null,
    coinType: 0,
    chainType: 'bitcoin',
    derivationPath: "m/44'/0'/8'/0/",
    image: "/images/bitcoin.png"
  }
};

// Token configurations for multi-asset support
const TOKEN_CONFIG = {
  // Ethereum tokens
  'ethereum-usdt': {
    chain: 'ethereum',
    name: 'Tether USD',
    symbol: 'USDT',
    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
    tokenType: 'ERC20'
  },
  'ethereum-usdc': {
    chain: 'ethereum',
    name: 'USD Coin',
    symbol: 'USDC',
    contractAddress: '0xA0b86a33E6441545e94c4e6D71a7Bc4B7Bf76C02',
    decimals: 6,
    tokenType: 'ERC20'
  },
  
  // BSC tokens
  'bsc-usdt': {
    chain: 'bsc',
    name: 'Tether USD',
    symbol: 'USDT',
    contractAddress: '0x55d398326f99059fF775485246999027B3197955',
    decimals: 18,
    tokenType: 'BEP20'
  }
};

module.exports = { rpcMap, CHAIN_CONFIG, TOKEN_CONFIG };