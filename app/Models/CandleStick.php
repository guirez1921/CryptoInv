<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Candlestick extends Model
{
    protected $fillable = [
        'symbol', 'interval', 'open_time', 'open', 'high', 'low', 'close', 'volume', 'close_time'
    ];

    protected $casts = [
        'open_time'  => 'datetime',
        'close_time' => 'datetime',
    ];
}