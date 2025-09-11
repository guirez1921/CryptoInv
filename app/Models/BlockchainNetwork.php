<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlockchainNetwork extends Model
{
    protected $fillable = [
        'name',             // e.g. Ethereum, Binance Smart Chain
        'symbol',           // e.g. ETH, BNB
        'chain_id',         // e.g. 1 for Ethereum Mainnet
        'rpc_url',
        'explorer_url',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function assets()
    {
        return $this->hasMany(Asset::class);
    }
}
