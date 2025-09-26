<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class CryptoMarketService
{
    private string $apiKey;
    private string $baseUrl = 'https://pro-api.coinmarketcap.com/v1/';
    private string $sandboxUrl = 'https://sandbox-api.coinmarketcap.com/v1/';

    public function __construct()
    {
        $this->apiKey = config('services.coinmarketcap.api_key');
    }

    /**
     * Get global market metrics (Market Cap, Fear & Greed, etc.)
     */
    public function getGlobalMetrics(): array
    {
        try {
            $cacheKey = 'crypto_global_metrics';

            return Cache::remember($cacheKey, 300, function () { // Cache for 5 minutes
                $response = Http::withHeaders([
                    'X-CMC_PRO_API_KEY' => $this->apiKey,
                    'Accept' => 'application/json'
                ])->get($this->baseUrl . 'global-metrics/quotes/latest');

                if ($response->successful()) {
                    $data = $response->json()['data'];

                    return [
                        'total_market_cap' => $data['quote']['USD']['total_market_cap'] ?? 0,
                        'total_volume_24h' => $data['quote']['USD']['total_volume_24h'] ?? 0,
                        'bitcoin_dominance' => $data['btc_dominance'] ?? 0,
                        'ethereum_dominance' => $data['eth_dominance'] ?? 0,
                        'market_cap_change_24h' => $data['quote']['USD']['total_market_cap_yesterday_percentage_change'] ?? 0,
                        'last_updated' => $data['last_updated'] ?? now()->toISOString()
                    ];
                }

                Log::info('Fetching global metric successful:', ['data' => $response->json()]);
                return $this->getDefaultGlobalMetrics();
            });
        } catch (\Exception $e) {
            Log::error('Failed to fetch global crypto metrics', ['error' => $e->getMessage()]);
            return $this->getDefaultGlobalMetrics();
        }
    }

    /**
     * Get Fear & Greed Index (from alternative.me API as CMC doesn't provide this)
     */
    public function getFearGreedIndex(): array
    {
        try {
            $cacheKey = 'crypto_fear_greed_index';

            return Cache::remember($cacheKey, 3600, function () { // Cache for 1 hour
                $response = Http::get('https://api.alternative.me/fng/');

                if ($response->successful()) {
                    $data = $response->json()['data'][0];

                    return [
                        'value' => (int) $data['value'],
                        'classification' => $data['value_classification'],
                        'timestamp' => $data['timestamp'],
                        'last_updated' => now()->toISOString()
                    ];
                }
                Log::info('Fetching Fear & Greed Index successful:', ['data' => $response->json()]);

                return [
                    'value' => 50,
                    'classification' => 'Neutral',
                    'timestamp' => now()->timestamp,
                    'last_updated' => now()->toISOString()
                ];
            });
        } catch (\Exception $e) {
            Log::error('Failed to fetch Fear & Greed Index', ['error' => $e->getMessage()]);
            return [
                'value' => 50,
                'classification' => 'Neutral',
                'timestamp' => now()->timestamp,
                'last_updated' => now()->toISOString()
            ];
        }
    }

    /**
     * Get top cryptocurrencies with RSI data
     */
    public function getTopCryptocurrencies(int $limit = 20): array
    {
        try {
            $cacheKey = "crypto_top_currencies_{$limit}";

            return Cache::remember($cacheKey, 300, function () use ($limit) { // Cache for 5 minutes
                $response = Http::withHeaders([
                    'X-CMC_PRO_API_KEY' => $this->apiKey,
                    'Accept' => 'application/json'
                ])->get($this->baseUrl . 'cryptocurrency/listings/latest', [
                    'start' => 1,
                    'limit' => $limit,
                    'convert' => 'USD',
                    'sort' => 'market_cap',
                    'sort_dir' => 'desc'
                ]);

                if ($response->successful()) {
                    $data = $response->json()['data'];

                    return array_map(function ($crypto) {
                        return [
                            'id' => $crypto['id'],
                            'name' => $crypto['name'],
                            'symbol' => $crypto['symbol'],
                            'slug' => $crypto['slug'],
                            'logo' => "https://s2.coinmarketcap.com/static/img/coins/64x64/{$crypto['id']}.png",
                            'market_cap' => $crypto['quote']['USD']['market_cap'] ?? 0,
                            'price' => $crypto['quote']['USD']['price'] ?? 0,
                            'percent_change_1h' => $crypto['quote']['USD']['percent_change_1h'] ?? 0,
                            'percent_change_24h' => $crypto['quote']['USD']['percent_change_24h'] ?? 0,
                            'percent_change_7d' => $crypto['quote']['USD']['percent_change_7d'] ?? 0,
                            'volume_24h' => $crypto['quote']['USD']['volume_24h'] ?? 0,
                            'circulating_supply' => $crypto['circulating_supply'] ?? 0,
                            'total_supply' => $crypto['total_supply'] ?? 0,
                            'max_supply' => $crypto['max_supply'],
                            'market_cap_rank' => $crypto['cmc_rank'],
                            'last_updated' => $crypto['last_updated'],
                            // Simulate RSI data (you can integrate with technical analysis APIs)
                            'rsi' => $this->generateSimulatedRSI($crypto['quote']['USD']['percent_change_24h'] ?? 0)
                        ];
                    }, $data);
                }
                Log::info('Fetching top cryptocurrencies successful:', ['data' => $response->json()]);

                return $this->getDefaultCryptocurrencies($limit);
            });
        } catch (\Exception $e) {
            Log::error('Failed to fetch top cryptocurrencies', ['error' => $e->getMessage()]);
            return $this->getDefaultCryptocurrencies($limit);
        }
    }

    public function getTopCryptocurrenciesFromFreeAPI(int $limit = 20): array
    {
        try {
            $cacheKey = "crypto_top_currencies_freeapi_{$limit}";

            return Cache::remember($cacheKey, 300, function () use ($limit) {
                $response = Http::get("https://freecryptoapi.com/api/v1/cryptocurrencies", [
                    'limit' => $limit,
                    'convert' => 'USD'
                ]);

                if ($response->successful()) {
                    $data = $response->json()['data'] ?? [];

                    return array_map(function ($crypto) {
                        return [
                            'id' => $crypto['id'],
                            'name' => $crypto['name'],
                            'symbol' => $crypto['symbol'],
                            'slug' => strtolower($crypto['name']),
                            'logo' => $crypto['logo'] ?? "https://via.placeholder.com/64?text={$crypto['symbol']}",
                            'market_cap' => $crypto['market_cap'] ?? 0,
                            'price' => $crypto['price'] ?? 0,
                            'percent_change_1h' => $crypto['percent_change_1h'] ?? 0,
                            'percent_change_24h' => $crypto['percent_change_24h'] ?? 0,
                            'percent_change_7d' => $crypto['percent_change_7d'] ?? 0,
                            'volume_24h' => $crypto['volume_24h'] ?? 0,
                            'circulating_supply' => $crypto['circulating_supply'] ?? 0,
                            'total_supply' => $crypto['total_supply'] ?? 0,
                            'max_supply' => $crypto['max_supply'] ?? null,
                            'market_cap_rank' => $crypto['market_cap_rank'] ?? null,
                            'last_updated' => $crypto['last_updated'] ?? now()->toISOString(),
                            'rsi' => $this->generateSimulatedRSI($crypto['percent_change_24h'] ?? 0)
                        ];
                    }, $data);
                }
                Log::info('Fetching top cryptocurrencies from FreeCryptoAPI successful:', ['data' => $response->json()]);

                return $this->getDefaultCryptocurrencies($limit);
            });
        } catch (\Exception $e) {
            Log::error('Failed to fetch top cryptocurrencies from FreeCryptoAPI', [
                'error' => $e->getMessage()
            ]);
            return $this->getDefaultCryptocurrencies($limit);
        }
    }

    public function getTopCryptocurrenciesFromCoinGecko(int $limit = 20): array
    {
        try {
            $cacheKey = "crypto_top_currencies_coingecko_{$limit}";

            return Cache::remember($cacheKey, 300, function () use ($limit) {
                $response = Http::get('https://api.coingecko.com/api/v3/coins/markets', [
                    'vs_currency' => 'usd',
                    'order' => 'market_cap_desc',
                    'per_page' => $limit,
                    'page' => 1,
                    'sparkline' => false
                ]);

                if ($response->successful()) {
                    $data = $response->json();

                    return array_map(function ($crypto) {
                        return [
                            'id' => $crypto['id'],
                            'name' => $crypto['name'],
                            'symbol' => strtoupper($crypto['symbol']),
                            'slug' => $crypto['id'],
                            'logo' => $crypto['image'],
                            'market_cap' => $crypto['market_cap'] ?? 0,
                            'price' => $crypto['current_price'] ?? 0,
                            'percent_change_1h' => $crypto['price_change_percentage_1h_in_currency'] ?? 0,
                            'percent_change_24h' => $crypto['price_change_percentage_24h'] ?? 0,
                            'percent_change_7d' => $crypto['price_change_percentage_7d_in_currency'] ?? 0,
                            'volume_24h' => $crypto['total_volume'] ?? 0,
                            'circulating_supply' => $crypto['circulating_supply'] ?? 0,
                            'total_supply' => $crypto['total_supply'] ?? 0,
                            'max_supply' => $crypto['max_supply'] ?? null,
                            'market_cap_rank' => $crypto['market_cap_rank'] ?? null,
                            'last_updated' => $crypto['last_updated'],
                            'rsi' => $this->generateSimulatedRSI($crypto['price_change_percentage_24h'] ?? 0)
                        ];
                    }, $data);
                }

                Log::info('CoinGecko fallback triggered:', ['response' => $response->json()]);
                return $this->getDefaultCryptocurrencies($limit);
            });
        } catch (\Exception $e) {
            Log::error('Failed to fetch top cryptocurrencies from CoinGecko', ['error' => $e->getMessage()]);
            return $this->getDefaultCryptocurrencies($limit);
        }
    }

    /**
     * Calculate average RSI from cryptocurrency data
     */
    public function calculateAverageRSI(array $cryptocurrencies): float
    {
        if (empty($cryptocurrencies)) {
            return 50.0; // Neutral RSI
        }

        $totalRsi = array_reduce($cryptocurrencies, function ($carry, $crypto) {
            return $carry + ($crypto['rsi'] ?? 50);
        }, 0);

        return round($totalRsi / count($cryptocurrencies), 1);
    }

    /**
     * Generate simulated RSI based on price change (placeholder)
     * In production, you'd want to use actual technical analysis data
     */
    private function generateSimulatedRSI(float $priceChange24h): float
    {
        // Simple simulation: map price changes to RSI ranges
        if ($priceChange24h > 10) {
            return mt_rand(70, 85); // Overbought
        } elseif ($priceChange24h > 5) {
            return mt_rand(60, 75); // Bullish
        } elseif ($priceChange24h > 0) {
            return mt_rand(50, 65); // Slightly bullish
        } elseif ($priceChange24h > -5) {
            return mt_rand(35, 55); // Slightly bearish
        } elseif ($priceChange24h > -10) {
            return mt_rand(25, 45); // Bearish
        } else {
            return mt_rand(15, 35); // Oversold
        }
    }

    /**
     * Get default global metrics (fallback)
     */
    private function getDefaultGlobalMetrics(): array
    {
        return [
            'total_market_cap' => 2500000000000, // $2.5T
            'total_volume_24h' => 100000000000, // $100B
            'bitcoin_dominance' => 50.0,
            'ethereum_dominance' => 17.0,
            'market_cap_change_24h' => 0.0,
            'last_updated' => now()->toISOString()
        ];
    }

    /**
     * Get default cryptocurrencies (fallback)
     */
    private function getDefaultCryptocurrencies(int $limit): array
    {
        $defaultCryptos = [
            ['id' => 1, 'name' => 'Bitcoin', 'symbol' => 'BTC', 'price' => 45000, 'percent_change_24h' => 2.5, 'market_cap' => 850000000000],
            ['id' => 1027, 'name' => 'Ethereum', 'symbol' => 'ETH', 'price' => 2800, 'percent_change_24h' => 1.8, 'market_cap' => 340000000000],
            ['id' => 825, 'name' => 'Tether USDt', 'symbol' => 'USDT', 'price' => 1.00, 'percent_change_24h' => 0.1, 'market_cap' => 95000000000],
            ['id' => 1839, 'name' => 'BNB', 'symbol' => 'BNB', 'price' => 320, 'percent_change_24h' => -1.2, 'market_cap' => 50000000000],
            ['id' => 5426, 'name' => 'Solana', 'symbol' => 'SOL', 'price' => 85, 'percent_change_24h' => 3.2, 'market_cap' => 35000000000],
        ];

        return array_slice(array_map(function ($crypto) use ($defaultCryptos) {
            return [
                'id' => $crypto['id'],
                'name' => $crypto['name'],
                'symbol' => $crypto['symbol'],
                'slug' => strtolower($crypto['name']),
                'logo' => "https://s2.coinmarketcap.com/static/img/coins/64x64/{$crypto['id']}.png",
                'market_cap' => $crypto['market_cap'],
                'price' => $crypto['price'],
                'percent_change_1h' => rand(-2, 2),
                'percent_change_24h' => $crypto['percent_change_24h'],
                'percent_change_7d' => rand(-10, 10),
                'volume_24h' => $crypto['market_cap'] * 0.1,
                'circulating_supply' => 0,
                'total_supply' => 0,
                'max_supply' => null,
                'market_cap_rank' => array_search($crypto, $defaultCryptos) + 1,
                'last_updated' => now()->toISOString(),
                'rsi' => $this->generateSimulatedRSI($crypto['percent_change_24h'])
            ];
        }, $defaultCryptos), 0, $limit);
    }

    /**
     * Format large numbers for display
     */
    public static function formatLargeNumber(float $number): string
    {
        if ($number >= 1_000_000_000_000) {
            return '$' . number_format($number / 1_000_000_000_000, 2) . 'T';
        } elseif ($number >= 1_000_000_000) {
            return '$' . number_format($number / 1_000_000_000, 2) . 'B';
        } elseif ($number >= 1_000_000) {
            return '$' . number_format($number / 1_000_000, 2) . 'M';
        } elseif ($number >= 1_000) {
            return '$' . number_format($number / 1_000, 2) . 'K';
        } else {
            return '$' . number_format($number, 2);
        }
    }

    /**
     * Get RSI classification
     */
    public static function getRSIClassification(float $rsi): array
    {
        if ($rsi >= 70) {
            return ['label' => 'Overbought', 'color' => 'text-red-400'];
        } elseif ($rsi >= 50) {
            return ['label' => 'Bullish', 'color' => 'text-green-400'];
        } elseif ($rsi >= 30) {
            return ['label' => 'Bearish', 'color' => 'text-orange-400'];
        } else {
            return ['label' => 'Oversold', 'color' => 'text-blue-400'];
        }
    }
}
