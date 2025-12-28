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

        // Create the primary admin user
        Admin::factory()->for(
            User::factory()->state([
                'name' => 'admin',
                'email' => 'admin@cryptoinv.com',
                'password' => bcrypt('admin123'),
                'email_verified_at' => Carbon::now(),
                'status' => 'active',
            ])
        )->create();

        $now = Carbon::now();
        $chains = [
            ['name' => 'Ethereum', 'abv_name' => 'ethereum', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'Solana', 'abv_name' => 'solana', 'icon' => '', 'asset_type' => 'native', 'decimals' => 9],
            ['name' => 'Bitcoin', 'abv_name' => 'bitcoin', 'icon' => '', 'asset_type' => 'native', 'decimals' => 8],
            ['name' => 'Tron', 'abv_name' => 'tron', 'icon' => '', 'asset_type' => 'native', 'decimals' => 6],
            ['name' => 'Polygon', 'abv_name' => 'polygon', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'Base', 'abv_name' => 'base', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'Avalanche', 'abv_name' => 'avalanche', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'Optimism', 'abv_name' => 'optimism', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'Arbitrum', 'abv_name' => 'arbitrum', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'BSC', 'abv_name' => 'bsc', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'Linea', 'abv_name' => 'linea', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'Blast', 'abv_name' => 'blast', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'Palm', 'abv_name' => 'palm', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'Starknet', 'abv_name' => 'starknet', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'Celo', 'abv_name' => 'celo', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'ZkSync', 'abv_name' => 'zksync', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'Mantle', 'abv_name' => 'mantle', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'OPBNB', 'abv_name' => 'opbnb', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'Scroll', 'abv_name' => 'scroll', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'Sei', 'abv_name' => 'sei', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'Swellchain', 'abv_name' => 'swellchain', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'Unichain', 'abv_name' => 'unichain', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'Sepolia', 'abv_name' => 'sepolia', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'Polygon Amoy', 'abv_name' => 'polygonAmoy', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'Base Sepolia', 'abv_name' => 'baseSepolia', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'Avalanche Fuji', 'abv_name' => 'avalancheFuji', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'Optimism Sepolia', 'abv_name' => 'optimismSepolia', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'Arbitrum Sepolia', 'abv_name' => 'arbitrumSepolia', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'BSC Testnet', 'abv_name' => 'bscTestnet', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'Linea Sepolia', 'abv_name' => 'lineaSepolia', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'Blast Sepolia', 'abv_name' => 'blastSepolia', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'Palm Testnet', 'abv_name' => 'palmTestnet', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'Starknet Sepolia', 'abv_name' => 'starknetSepolia', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'Celo Alfajores', 'abv_name' => 'celoAlfajores', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'ZkSync Sepolia', 'abv_name' => 'zksyncSepolia', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'Mantle Sepolia', 'abv_name' => 'mantleSepolia', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'OPBNB Testnet', 'abv_name' => 'opbnbTestnet', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'Scroll Sepolia', 'abv_name' => 'scrollSepolia', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'Sei Testnet', 'abv_name' => 'seiTestnet', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'Swellchain Testnet', 'abv_name' => 'swellchainTestnet', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'Unichain Sepolia', 'abv_name' => 'unichainSepolia', 'icon' => '', 'asset_type' => 'native', 'decimals' => 18],
            ['name' => 'Bitcoin Testnet', 'abv_name' => 'bitcoinTestnet', 'icon' => '', 'asset_type' => 'native', 'decimals' => 8],
            ['name' => 'Solana Devnet', 'abv_name' => 'solanaDevnet', 'icon' => '', 'asset_type' => 'native', 'decimals' => 9],
            ['name' => 'Tron Shasta', 'abv_name' => 'tronShasta', 'icon' => '', 'asset_type' => 'native', 'decimals' => 6],
            ['name' => 'Tron Nile', 'abv_name' => 'tronNile', 'icon' => '', 'asset_type' => 'native', 'decimals' => 6],
        ];
        // Add tokens like USDT and USDC 
        $tokens = [
            ['name' => 'Tether USD', 'abv_name' => 'usdt', 'icon' => '', 'contract_address' => '0xdAC17F958D2ee523a2206206994597C13D831ec7', 'asset_type' => 'token', 'decimals' => 6],
            ['name' => 'USD Coin', 'abv_name' => 'usdc', 'icon' => '', 'contract_address' => '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 'asset_type' => 'token', 'decimals' => 6],
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
