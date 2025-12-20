<?php

namespace App\Jobs;

use App\Models\Candlestick;
use App\Events\CandlestickUpdated;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FetchCandlestickJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected array $symbols;
    protected string $interval;

    public function __construct(array $symbols, string $interval = '1m')
    {
        $this->symbols = $symbols;
        $this->interval = $interval;
    }

    public function handle(): void
    {
        foreach ($this->symbols as $symbol) {
            $response = Http::get("https://api.binance.com/api/v3/klines", [
                'symbol'   => $symbol,
                'interval' => $this->interval,
                'limit'    => 1,
            ]);

            // 🚨 Handle rate-limit errors
            if ($response->status() === 429 || $response->status() === 418) {
                Log::warning("Rate limit hit ({$response->status()}) for {$symbol}. Stopping job.");
                return; // discontinue job immediately
            }

            // ✅ Inspect headers for usage
            $usedWeight1m = $response->header('X-MBX-USED-WEIGHT-1m');
            $usedWeight1s = $response->header('X-MBX-USED-WEIGHT-1s');

            Log::info("Binance weight usage: {$usedWeight1m}/1200 per minute, {$usedWeight1s}/50 per second");

            if ($response->failed()) {
                Log::error("Failed to fetch candlestick for {$symbol}: " . $response->body());
                continue;
            }

            $data = $response->json()[0]; // [openTime, open, high, low, close, volume, closeTime, ...]

            $candle = Candlestick::updateOrCreate(
                [
                    'symbol'    => $symbol,
                    'interval'  => $this->interval,
                    'open_time' => date('Y-m-d H:i:s', $data[0] / 1000),
                ],
                [
                    'open'       => $data[1],
                    'high'       => $data[2],
                    'low'        => $data[3],
                    'close'      => $data[4],
                    'volume'     => $data[5],
                    'close_time' => date('Y-m-d H:i:s', $data[6] / 1000),
                ]
            );

            broadcast(new CandlestickUpdated($candle));
        }
    }
}
