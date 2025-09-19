<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class HdWallet extends Model
{
    // Table name (explicit for clarity)
    protected $table = 'hd_wallets';

    protected $fillable = [
        'account_id',
        'type',
        'encrypted_seed',
        'chain',
        'address_index',
        'is_active',
        'verified_at',
        'last_sync_at',
        'locked_at',
        'metadata',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'verified_at' => 'datetime',
        'last_sync_at' => 'datetime',
        'locked_at' => 'datetime',
        'metadata' => 'array',
    ];

    /**
     * Relationship: HdWallet belongs to an Account
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Relationship: HdWallet has many WalletAddress records
     */
    public function addresses(): HasMany
    {
        return $this->hasMany(WalletAddress::class, 'hd_wallet_id');
    }

    /**
     * Return the first unused address for this HD wallet (or null)
     */
    public function unusedAddress()
    {
        return $this->addresses()->where('is_used', false)->orderBy('address_index', 'asc')->first();
    }

    /**
     * Increment address index and persist
     * @param int $by
     * @return int new index
     */
    public function incrementAddressIndex(int $by = 1): int
    {
        $this->address_index = $this->address_index + $by;
        $this->save();
        return (int) $this->address_index;
    }

    /**
     * Mark wallet active/inactive
     */
    public function markActive(bool $active = true): void
    {
        $this->is_active = $active;
        $this->save();
    }

    /**
     * Lock/unlock wallet for operations
     */
    public function lock(): void
    {
        $this->locked_at = Carbon::now();
        $this->save();
    }

    public function unlock(): void
    {
        $this->locked_at = null;
        $this->save();
    }
}
