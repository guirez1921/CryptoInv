<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPreference extends Model
{
    protected $fillable = [
        'user_id', 'kyc_status', 'two_factor_enabled',
        'notification_daily_reports', 'notification_weekly_summaries', 'notification_monthly_statements',
        'notification_trade_execution', 'notification_login_new_device', 'notification_failed_login',
        'notification_password_changes', 'notification_withdrawal_requests',
    ];
    
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
