<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Asset extends Model
{
    protected $fillable = [
        'name',
        'symbol',
        'network',
        'contract_address',
        'decimals',
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
