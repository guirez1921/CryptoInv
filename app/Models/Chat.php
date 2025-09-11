<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Chat extends Model
{
    protected $fillable = [
        'user_id',
        'admin_id',
        'message',
        'message_type',
        'status',
        'is_from_admin',
        'is_bot_message',
        'replied_to_id'
    ];

    protected $casts = [
        'is_from_admin' => 'boolean',
        'is_bot_message' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(Admin::class);
    }

    public function repliedTo(): BelongsTo
    {
        return $this->belongsTo(Chat::class, 'replied_to_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(Chat::class, 'replied_to_id');
    }

    // Scope for getting conversation between user and their admin
    public function scopeConversation($query, $userId, $adminId = null)
    {
        if ($adminId) {
            return $query->where(function ($q) use ($userId, $adminId) {
                $q->where('user_id', $userId)->where('admin_id', $adminId);
            // })->orWhere(function ($q) use ($userId, $adminId) {
            //     $q->where('user_id', $adminId)->where('admin_id', $userId);
            });
        }
        
        return $query->where('user_id', $userId);
    }
}
