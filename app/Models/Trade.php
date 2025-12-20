<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Trade extends Model
{
    protected $fillable = [
        'user_id', 'asset_id', 'strategy', 'amount',
        'entry_price', 'exit_price', 'status',
        'started_at', 'ended_at', 'profit_loss',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function user()
    {
        return $this->account->user();
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }
}
