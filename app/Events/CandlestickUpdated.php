<?php

namespace App\Events;

use App\Models\Candlestick;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;

class CandlestickUpdated implements ShouldBroadcastNow
{
    use SerializesModels;

    public $candle;

    public function __construct(Candlestick $candle)
    {
        $this->candle = $candle;
    }

    public function broadcastOn(): Channel
    {
        return new Channel('candlesticks.' . $this->candle->symbol);
    }

    public function broadcastWith(): array
    {
        return [
            'symbol'     => $this->candle->symbol,
            'interval'   => $this->candle->interval,
            'open_time'  => $this->candle->open_time,
            'open'       => $this->candle->open,
            'high'       => $this->candle->high,
            'low'        => $this->candle->low,
            'close'      => $this->candle->close,
            'volume'     => $this->candle->volume,
            'close_time' => $this->candle->close_time,
        ];
    }
}
