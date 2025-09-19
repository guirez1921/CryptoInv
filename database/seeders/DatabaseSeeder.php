<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\User;
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

        DB::table('chain_configs')->insert([
            // --- Ethereum ---
            [
                'chain_key' => 'ethereum',
                'name' => 'Ethereum',
                'symbol' => 'ETH',
                'coin_type' => 60,
                'decimals' => 18,
                'chain_id' => 1,
                'min_deposit' => 0.01,
                'withdrawal_fee' => 0.005,
                'is_active' => true,
                'network_type' => 'mainnet',
                'metadata' => json_encode([
                    'rpc' => 'https://mainnet.infura.io/v3/<API_KEY>',
                    'explorer' => 'https://etherscan.io'
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // --- Sepolia (testnet) ---
            [
                'chain_key' => 'sepolia',
                'name' => 'Ethereum Sepolia',
                'symbol' => 'ETH',
                'coin_type' => 60,
                'decimals' => 18,
                'chain_id' => 11155111,
                'min_deposit' => 0.001,
                'withdrawal_fee' => 0.0001,
                'is_active' => true,
                'network_type' => 'testnet',
                'metadata' => json_encode([
                    'rpc' => 'https://sepolia.infura.io/v3/<API_KEY>',
                    'explorer' => 'https://sepolia.etherscan.io'
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // --- Polygon ---
            [
                'chain_key' => 'polygon',
                'name' => 'Polygon',
                'symbol' => 'MATIC',
                'coin_type' => 966,
                'decimals' => 18,
                'chain_id' => 137,
                'min_deposit' => 1,
                'withdrawal_fee' => 0.1,
                'is_active' => true,
                'network_type' => 'mainnet',
                'metadata' => json_encode([
                    'rpc' => 'https://polygon-mainnet.infura.io/v3/<API_KEY>',
                    'explorer' => 'https://polygonscan.com'
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // --- Binance Smart Chain (BSC) ---
            [
                'chain_key' => 'bsc',
                'name' => 'Binance Smart Chain',
                'symbol' => 'BNB',
                'coin_type' => 714,
                'decimals' => 18,
                'chain_id' => 56,
                'min_deposit' => 0.01,
                'withdrawal_fee' => 0.001,
                'is_active' => true,
                'network_type' => 'mainnet',
                'metadata' => json_encode([
                    'rpc' => 'https://bsc-mainnet.infura.io/v3/<API_KEY>',
                    'explorer' => 'https://bscscan.com'
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // --- Arbitrum ---
            [
                'chain_key' => 'arbitrum',
                'name' => 'Arbitrum',
                'symbol' => 'ETH',
                'coin_type' => 60,
                'decimals' => 18,
                'chain_id' => 42161,
                'min_deposit' => 0.01,
                'withdrawal_fee' => 0.0005,
                'is_active' => true,
                'network_type' => 'mainnet',
                'metadata' => json_encode([
                    'rpc' => 'https://arbitrum-mainnet.infura.io/v3/<API_KEY>',
                    'explorer' => 'https://arbiscan.io'
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // --- Optimism ---
            [
                'chain_key' => 'optimism',
                'name' => 'Optimism',
                'symbol' => 'ETH',
                'coin_type' => 60,
                'decimals' => 18,
                'chain_id' => 10,
                'min_deposit' => 0.01,
                'withdrawal_fee' => 0.0005,
                'is_active' => true,
                'network_type' => 'mainnet',
                'metadata' => json_encode([
                    'rpc' => 'https://optimism-mainnet.infura.io/v3/<API_KEY>',
                    'explorer' => 'https://optimistic.etherscan.io'
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // --- Base ---
            [
                'chain_key' => 'base',
                'name' => 'Base',
                'symbol' => 'ETH',
                'coin_type' => 60,
                'decimals' => 18,
                'chain_id' => 8453,
                'min_deposit' => 0.01,
                'withdrawal_fee' => 0.0005,
                'is_active' => true,
                'network_type' => 'mainnet',
                'metadata' => json_encode([
                    'rpc' => 'https://base-mainnet.infura.io/v3/<API_KEY>',
                    'explorer' => 'https://basescan.org'
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // --- Avalanche ---
            [
                'chain_key' => 'avalanche',
                'name' => 'Avalanche',
                'symbol' => 'AVAX',
                'coin_type' => 9000,
                'decimals' => 18,
                'chain_id' => 43114,
                'min_deposit' => 0.1,
                'withdrawal_fee' => 0.01,
                'is_active' => true,
                'network_type' => 'mainnet',
                'metadata' => json_encode([
                    'rpc' => 'https://avalanche-mainnet.infura.io/v3/<API_KEY>',
                    'explorer' => 'https://snowtrace.io'
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // --- Celo ---
            [
                'chain_key' => 'celo',
                'name' => 'Celo',
                'symbol' => 'CELO',
                'coin_type' => 52752,
                'decimals' => 18,
                'chain_id' => 42220,
                'min_deposit' => 0.1,
                'withdrawal_fee' => 0.01,
                'is_active' => true,
                'network_type' => 'mainnet',
                'metadata' => json_encode([
                    'rpc' => 'https://celo-mainnet.infura.io/v3/<API_KEY>',
                    'explorer' => 'https://celoscan.io'
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // --- ZKsync ---
            [
                'chain_key' => 'zksync',
                'name' => 'ZKsync Era',
                'symbol' => 'ETH',
                'coin_type' => 60,
                'decimals' => 18,
                'chain_id' => 324,
                'min_deposit' => 0.01,
                'withdrawal_fee' => 0.0005,
                'is_active' => true,
                'network_type' => 'mainnet',
                'metadata' => json_encode([
                    'rpc' => 'https://zksync-mainnet.infura.io/v3/<API_KEY>',
                    'explorer' => 'https://explorer.zksync.io'
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // --- Linea ---
            [
                'chain_key' => 'linea',
                'name' => 'Linea',
                'symbol' => 'ETH',
                'coin_type' => 60,
                'decimals' => 18,
                'chain_id' => 59144,
                'min_deposit' => 0.01,
                'withdrawal_fee' => 0.0005,
                'is_active' => true,
                'network_type' => 'mainnet',
                'metadata' => json_encode([
                    'rpc' => 'https://linea-mainnet.infura.io/v3/<API_KEY>',
                    'explorer' => 'https://lineascan.build'
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // --- Scroll ---
            [
                'chain_key' => 'scroll',
                'name' => 'Scroll',
                'symbol' => 'ETH',
                'coin_type' => 60,
                'decimals' => 18,
                'chain_id' => 534352,
                'min_deposit' => 0.01,
                'withdrawal_fee' => 0.0005,
                'is_active' => true,
                'network_type' => 'mainnet',
                'metadata' => json_encode([
                    'rpc' => 'https://scroll-mainnet.infura.io/v3/<API_KEY>',
                    'explorer' => 'https://scrollscan.com'
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
