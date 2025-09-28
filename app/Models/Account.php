<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Account extends Model
{
    protected $fillable = [
        'user_id', 'admin_id', 'total_balance', 'total_balance_change',
        'inv_balance', 'ava_balance', 'profit',
        'total_deposits', 'total_withdrawals',
        'unrealized_pnl', 'realized_pnl',
        'last_activity_at', 'is_active', 'account_type',
    ];

    public function user():BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(Admin::class);
    }

    public function wallets(): HasMany
    {
        return $this->hasMany(HdWallet::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(BlockchainTransaction::class);
    }

    public function getDepositAddress(string $chain): ?string
    {
        $hdWallet = $this->wallets()->first();
        if (!$hdWallet) {
            return null;
        }

        // addresses() is a HasMany relation; ->addresses returns a Collection.
        // Return the first address record's `address` value if present.
        $firstAddress = $hdWallet->addresses()->where('chain', $chain)->first();
        return $firstAddress ? $firstAddress->address : null;
    }
}
