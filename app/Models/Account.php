<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Account extends Model
{
    protected $fillable = [
        'user_id', 'admin_id', 'total_balance', 'available_balance', 'invested_balance',
        'profit', 'total_deposits', 'total_withdrawals', 'min_withdrawal', 'crypto_balance',
        'unrealized_pnl', 'realized_pnl',
        'last_activity_at', 'is_active', 'account_type',
        'demo_balance',
    ];

    protected $casts = [
        'total_balance' => 'decimal:2',
        'available_balance' => 'decimal:2',
        'invested_balance' => 'decimal:2',
        'profit' => 'decimal:2',
        'total_deposits' => 'decimal:2',
        'total_withdrawals' => 'decimal:2',
        'min_withdrawal' => 'decimal:2',
        'unrealized_pnl' => 'decimal:2',
        'realized_pnl' => 'decimal:2',
        'demo_balance' => 'decimal:2',
        'last_activity_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function user():BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function userAssets(): HasMany
    {
        return $this->hasMany(UserAsset::class, 'user_id', 'user_id');
    }

    /**
     * Calculate the total USD value of all crypto assets in the portfolio
     */
    public function getCryptoTotalUsdValue(): float
    {
        return $this->userAssets->sum(function ($userAsset) {
            $price = $userAsset->asset->current_price_usd ?? 0;
            return $userAsset->available_balance * $price;
        });
    }

    /**
     * Get the total portfolio value (Account Balance + Crypto Assets Value)
     */
    public function getTotalPortfolioValue(): float
    {
        return (float)$this->total_balance + $this->getCryptoTotalUsdValue();
    }

    /**
     * Calculate unrealized P&L for all active trades
     */
    public function calculateUnrealizedPnl(): float
    {
        return $this->trades()->where('status', 'active')->get()->sum(function ($trade) {
            $currentPrice = $trade->asset ? ($trade->asset->current_price_usd ?? $trade->entry_price) : 1;
            return ($currentPrice - $trade->entry_price) * $trade->amount;
        });
    }

    /**
     * Calculate realized P&L from closed trades
     */
    public function calculateRealizedPnl(): float
    {
        return $this->trades()->where('status', 'closed')->sum('profit_loss');
    }

    /**
     * Synchronize account statistics with trade data
     */
    public function syncWithTrades(): void
    {
        $realized = $this->calculateRealizedPnl();
        $unrealized = $this->calculateUnrealizedPnl();
        $invested = $this->trades()->where('status', 'active')->sum('amount');

        $this->update([
            'realized_pnl' => $realized,
            'unrealized_pnl' => $unrealized,
            'profit' => $realized, // Usually 'profit' in this schema refers to realized gains
            'invested_balance' => $invested,
            'last_activity_at' => now(),
        ]);
    }

    public function deposits(): HasMany
    {
        return $this->hasMany(Deposit::class);
    }

    public function withdrawals(): HasMany
    {
        return $this->hasMany(Withdrawal::class);
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(Admin::class);
    }

    public function wallets(): HasMany
    {
        return $this->hasMany(HdWallet::class);
    }

    /**
     * Get the primary HD wallet for this account
     */
    public function hdWallet()
    {
        return $this->hasOne(HdWallet::class);
    }


    public function transactions(): HasMany
    {
        return $this->hasMany(BlockchainTransaction::class);
    }

    public function trades(): HasMany
    {
        return $this->hasMany(Trade::class);
    }

    public function getDepositAddress(string $chain): ?WalletAddress
    {
        $hdWallet = $this->wallets()->first();
        if (!$hdWallet) {
            return null;
        }

        // addresses() is a HasMany relation; ->addresses returns a Collection.
        // Return the first address record's `address` value if present.
        $firstAddress = $hdWallet->addresses()->where('chain', $chain)->first();
        return $firstAddress;
    }
}
