<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class UserAsset extends Model
{
    protected $fillable = [
        'user_id',
        'asset_id',
        'available_balance',
        'locked_balance',
        'invested_balance',
        'average_entry_price',
        'total_deposited',
        'total_withdrawn',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    public function handleDeposit(Deposit $deposit)
    {
        $user   = $deposit->account->user;   // or $deposit->account if you switched
        $asset  = $deposit->asset;
        $amount = $deposit->amount;

        // Create or update the user_asset row
        $userAsset = UserAsset::updateOrCreate(
            [
                'user_id'  => $user->id,
                'asset_id' => $asset->id,
            ],
            [
                // If new, start with this amount
                'available_balance' => DB::raw("available_balance + {$amount}"),
                'total_deposited'   => DB::raw("total_deposited + {$amount}"),
            ]
        );

        return $userAsset;
    }
}
