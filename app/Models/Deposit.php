<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Deposit extends Model
{
    protected $fillable = [
        'user_id',
        'asset_id',
        'blockchain_transaction_id',
        'deposit_address',
        'amount',
        'network_fee',
        'status',
        'transaction_hash',
        'confirmations',
        'required_confirmations',
        'confirmed_at',
        'notes',
        'metadata',
        'chain',
        'wallet_address_id',
    ];

    protected $casts = [
        'metadata' => 'array',
        'confirmed_at' => 'datetime',
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

    public function blockchainTransaction(): BelongsTo
    {
        return $this->belongsTo(BlockchainTransaction::class);
    }

    public function walletAddress(): BelongsTo
    {
        return $this->belongsTo(WalletAddress::class);
    }

    public function getAddress(): string
    {
        return $this->walletAddress->address;
    }
}
