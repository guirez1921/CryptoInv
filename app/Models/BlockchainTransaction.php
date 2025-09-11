<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class BlockchainTransaction extends Model
{
    protected $fillable = [
        'hash', 'block_number', 'status', 'confirmations', 'raw_response',
    ];

    public function deposit(): HasOne
    {
        return $this->hasOne(Deposit::class);
    }

    public function withdrawal(): HasOne
    {
        return $this->hasOne(Withdrawal::class);
    }
}
