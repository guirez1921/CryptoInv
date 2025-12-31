<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Asset extends Model
{
    protected $fillable = [
        'name',
        'abv_name',
        'symbol',
        'network',
        'icon',
        'contract_address',
        'asset_type',
        'decimals',
        'current_price_usd',
        'is_active',
        'supports_deposits',
        'supports_withdrawals',
    ];

    public function deposits(): HasMany
    {
        return $this->hasMany(Deposit::class);
    }

    public function withdrawals(): HasMany
    {
        return $this->hasMany(Withdrawal::class);
    }

    public function trades(): HasMany
    {
        return $this->hasMany(Trade::class);
    }

    public function userAssets()
    {
        return $this->hasMany(UserAsset::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_assets')
            ->withPivot([
                'available_balance',
                'locked_balance',
                'invested_balance',
                'average_entry_price',
                'total_deposited',
                'total_withdrawn',
            ])
            ->withTimestamps();
    }
}
