<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class BlockchainTransaction extends Model
{
    protected $fillable = [
        'asset_id', 'account_id', 'hd_wallet_id', 'wallet_address_id',
        'chain', 'type', 'tx_hash', 'from_address', 'to_address',
        'amount', 'gas_fee', 'error_message', 'status', 'confirmed_at', 'metadata',
    ];
    
    protected $casts = [
        'confirmed_at' => 'datetime',
        'metadata' => 'array',
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
