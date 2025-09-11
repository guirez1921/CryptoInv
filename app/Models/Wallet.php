<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Wallet extends Model
{
    //
    protected $fillable = [
        'account_id',
        'type',
        'address',
        'chain',
        'private_key',
        'verified_at',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
    ];

    /**
     * Relationship: Wallet belongs to an Account
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function isGenerated(): bool
    {
        return $this->type == 'generated';
    }

}
