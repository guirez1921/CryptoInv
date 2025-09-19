<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WalletAddress extends Model
{
    protected $table = 'wallet_addresses';

    protected $fillable = [
        'hd_wallet_id',
        'address',
        'address_index',
        'derivation_path',
        'purpose',
        'balance',
        'gas_balance',
        'is_used',
        'used_at',
        'last_sync_at',
        'metadata',
    ];

    protected $casts = [
        'address_index' => 'integer',
        'balance' => 'decimal:18',
        'gas_balance' => 'decimal:18',
        'is_used' => 'boolean',
        'used_at' => 'datetime',
        'last_sync_at' => 'datetime',
        'metadata' => 'array',
    ];

    /**
     * Relationship: WalletAddress belongs to HdWallet
     */
    public function hdWallet(): BelongsTo
    {
        return $this->belongsTo(HdWallet::class, 'hd_wallet_id');
    }

    /**
     * Mark this address as used
     */
    public function markAsUsed(): void
    {
        $this->is_used = true;
        $this->used_at = now();
        $this->save();
    }

    /**
     * Update the stored balance (accepts numeric or string)
     */
    public function updateBalance($amount): void
    {
        $this->balance = $amount;
        $this->last_sync_at = now();
        $this->save();
    }

    /**
     * Scope to get unused addresses
     */
    public function scopeUnused($query)
    {
        return $query->where('is_used', false);
    }
}
