<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\User;
use Carbon\Carbon;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        Admin::factory()->create();

        $now = Carbon::now();
        $chains = [
            ['name' => 'Ethereum', 'abv_name' => 'ethereum', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'ETH'],
            ['name' => 'Solana', 'abv_name' => 'solana', 'icon' => '', 'asset_type' => 'native', 'decimals' => 9, 'symbol' => 'SOL'],
            ['name' => 'Bitcoin', 'abv_name' => 'bitcoin', 'icon' => '', 'asset_type' => 'native', 'decimals' => 8, 'symbol' => 'BTC'],
            ['name' => 'Tron', 'abv_name' => 'tron', 'icon' => '', 'asset_type' => 'native', 'decimals' => 6, 'symbol' => 'TRX'],
            ['name' => 'Polygon', 'abv_name' => 'polygon', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'MATIC'],
            ['name' => 'Base', 'abv_name' => 'base', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'ETH'],
            ['name' => 'Avalanche', 'abv_name' => 'avalanche', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'AVAX'],
            ['name' => 'Optimism', 'abv_name' => 'optimism', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'ETH'],
            ['name' => 'Arbitrum', 'abv_name' => 'arbitrum', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'ETH'],
            ['name' => 'BSC', 'abv_name' => 'bsc', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'BNB'],
            ['name' => 'Linea', 'abv_name' => 'linea', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'ETH'],
            ['name' => 'Blast', 'abv_name' => 'blast', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'ETH'],
            ['name' => 'Palm', 'abv_name' => 'palm', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'PALM'],
            ['name' => 'Starknet', 'abv_name' => 'starknet', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'ETH'],
            ['name' => 'Celo', 'abv_name' => 'celo', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'CELO'],
            ['name' => 'ZkSync', 'abv_name' => 'zksync', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'ETH'],
            ['name' => 'Mantle', 'abv_name' => 'mantle', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'MNT'],
            ['name' => 'OPBNB', 'abv_name' => 'opbnb', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'BNB'],
            ['name' => 'Scroll', 'abv_name' => 'scroll', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'ETH'],
            ['name' => 'Sei', 'abv_name' => 'sei', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'SEI'],
            ['name' => 'Swellchain', 'abv_name' => 'swellchain', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'ETH'],
            ['name' => 'Unichain', 'abv_name' => 'unichain', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'ETH'],
            ['name' => 'Sepolia', 'abv_name' => 'sepolia', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'ETH'],
            ['name' => 'Polygon Amoy', 'abv_name' => 'polygonAmoy', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'MATIC'],
            ['name' => 'Base Sepolia', 'abv_name' => 'baseSepolia', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'ETH'],
            ['name' => 'Avalanche Fuji', 'abv_name' => 'avalancheFuji', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'AVAX'],
            ['name' => 'Optimism Sepolia', 'abv_name' => 'optimismSepolia', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'ETH'],
            ['name' => 'Arbitrum Sepolia', 'abv_name' => 'arbitrumSepolia', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'ETH'],
            ['name' => 'BSC Testnet', 'abv_name' => 'bscTestnet', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'BNB'],
            ['name' => 'Linea Sepolia', 'abv_name' => 'lineaSepolia', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'ETH'],
            ['name' => 'Blast Sepolia', 'abv_name' => 'blastSepolia', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'ETH'],
            ['name' => 'Palm Testnet', 'abv_name' => 'palmTestnet', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'PALM'],
            ['name' => 'Starknet Sepolia', 'abv_name' => 'starknetSepolia', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'ETH'],
            ['name' => 'Celo Alfajores', 'abv_name' => 'celoAlfajores', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'CELO'],
            ['name' => 'ZkSync Sepolia', 'abv_name' => 'zksyncSepolia', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'ETH'],
            ['name' => 'Mantle Sepolia', 'abv_name' => 'mantleSepolia', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'MNT'],
            ['name' => 'OPBNB Testnet', 'abv_name' => 'opbnbTestnet', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'BNB'],
            ['name' => 'Scroll Sepolia', 'abv_name' => 'scrollSepolia', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'ETH'],
            ['name' => 'Sei Testnet', 'abv_name' => 'seiTestnet', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'SEI'],
            ['name' => 'Swellchain Testnet', 'abv_name' => 'swellchainTestnet', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'ETH'],
            ['name' => 'Unichain Sepolia', 'abv_name' => 'unichainSepolia', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18, 'symbol' => 'ETH'],
            ['name' => 'Bitcoin Testnet', 'abv_name' => 'bitcoinTestnet', 'icon' => '', 'asset_type' => 'native', 'decimals' => 8, 'symbol' => 'BTC'],
            ['name' => 'Solana Devnet', 'abv_name' => 'solanaDevnet', 'icon' => '', 'asset_type' => 'native', 'decimals' => 9, 'symbol' => 'SOL'],
            ['name' => 'Tron Shasta', 'abv_name' => 'tronShasta', 'icon' => '', 'asset_type' => 'native', 'decimals' => 6, 'symbol' => 'TRX'],
            ['name' => 'Tron Nile', 'abv_name' => 'tronNile', 'icon' => '', 'asset_type' => 'native', 'decimals' => 6, 'symbol' => 'TRX'],
        ];
        // Add tokens like USDT and USDC 
        $tokens = [
            ['name' => 'Tether USD', 'abv_name' => 'usdt', 'icon' => '', 'contract_address' => '0xdAC17F958D2ee523a2206206994597C13D831ec7', 'asset_type' => 'token', 'decimals' => 6, 'symbol' => 'USDT'],
            ['name' => 'USD Coin', 'abv_name' => 'usdc', 'icon' => '', 'contract_address' => '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 'asset_type' => 'token', 'decimals' => 6, 'symbol' => 'USDC'],
        ];
        foreach ($chains as $chain) {
            DB::table('assets')->updateOrInsert(
                ['abv_name' => $chain['abv_name']],

                [
                    'name' => $chain['name'],
                    'icon' => $chain['icon'] ?? fake()->imageUrl(64, 64, 'cryptocurrency', true),
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        };
        foreach ($tokens as $token) {
            DB::table('assets')->updateOrInsert(
                ['abv_name' => $token['abv_name']],

                [
                    'name' => $token['name'],
                    'icon' => $token['icon'] ?? fake()->imageUrl(64, 64, 'cryptocurrency', true),
                    'contract_address' => $token['contract_address'],
                    'asset_type' => $token['asset_type'],
                    'decimals' => $token['decimals'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }
    }
}
