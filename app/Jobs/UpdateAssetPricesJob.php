<?php

namespace App\Jobs;

use App\Models\Asset;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class UpdateAssetPricesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        // Map your asset symbols to CoinGecko IDs
        $symbolToId = [
            'BTC'  => 'bitcoin',
            'ETH'  => 'ethereum',
            'BNB'  => 'binancecoin',
            'MATIC' => 'polygon',
            'SOL'  => 'solana',
            'TRX'  => 'tron',
            'AVAX' => 'avalanche-2',
            'CELO' => 'celo',
            'USDT' => 'tether',
            'USDC' => 'usd-coin',
            'MNT'  => 'mantle',
            'SEI'  => 'sei-network',
            // add more mappings as needed
        ];

        $ids = implode(',', array_values($symbolToId));

        $response = Http::get("https://api.coingecko.com/api/v3/simple/price", [
            'ids' => $ids,
            'vs_currencies' => 'usd',
        ]);

        if ($response->failed()) {
            Log::error("Failed to fetch prices from CoinGecko: " . $response->body());
            return;
        }

        $prices = $response->json();

        foreach ($symbolToId as $symbol => $cgId) {
            if (!isset($prices[$cgId]['usd'])) {
                continue;
            }

            $price = $prices[$cgId]['usd'];

            Asset::where('abv_name', strtolower($symbol))
                ->orWhere('symbol', strtoupper($symbol))
                ->update([
                    'current_price_usd' => $price,
                    'price_updated_at'  => now(),
                ]);

            Log::info("Updated {$symbol} price to {$price} USD");
        }
    }
}
