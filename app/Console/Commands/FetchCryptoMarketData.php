<?php

namespace App\Console\Commands;

use App\Services\CryptoMarketService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class FetchCryptoMarketData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'crypto:fetch-market-data';



    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch and cache top cryptocurrencies and global metrics';

    /**
     * Execute the console command.
     */
    public function handle(CryptoMarketService $cryptoMarketService): void
    {
        try {
            $limit = 20;

            // Fetch and cache top cryptocurrencies
            // $cryptoMarketService->getTopCryptocurrencies($limit);

            // Optionally fetch from FreeCryptoAPI or CoinGecko
            // $cryptoMarketService->getTopCryptocurrenciesFromFreeAPI($limit);
            $cryptoMarketService->getTopCryptocurrenciesFromCoinGecko($limit);

            // Fetch and cache global metrics
            $cryptoMarketService->getGlobalMetrics();

            // Fetch and cache fear & greed index
            $cryptoMarketService->getFearGreedIndex();

            Log::info('Crypto market data cached successfully');
        } catch (\Exception $e) {
            Log::error('Failed to fetch crypto market data', ['error' => $e->getMessage()]);
        }
    }
}
