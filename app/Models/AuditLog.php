<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    protected $fillable = [
        'user_id',          // user who triggered the event
        'action',           // e.g. login, deposit, withdrawal, update
        'target_type',
        'target_id',
        'ip_address',
        'user_agent',
        'metadata',         // JSON field for extra info
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
