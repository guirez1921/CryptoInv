<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Withdrawal extends Model
{
    protected $fillable = [
        'user_id', 'asset_id', 'blockchain_transaction_id',
        'withdrawal_address', 'amount', 'network_fee', 'platform_fee',
        'final_amount', 'status', 'transaction_hash',
        'confirmations', 'required_confirmations',
        'sent_at', 'confirmed_at', 'approved_by_admin_id',
        'approved_at', 'admin_notes', 'rejection_reason', 'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'sent_at' => 'datetime',
        'confirmed_at' => 'datetime',
        'approved_at' => 'datetime',
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

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_admin_id');
    }
}
