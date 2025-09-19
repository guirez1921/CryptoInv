<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Notifications\CustomVerifyEmail;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Relationships
    public function account(): HasOne
    {
        return $this->hasOne(Account::class);
    }

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

    public function devices(): HasMany
    {
        return $this->hasMany(UserDevice::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(UserSession::class);
    }

    public function chats(): HasMany
    {
        return $this->hasMany(Chat::class);
    }

    public function preferences(): HasOne
    {
        return $this->hasOne(UserPreference::class);
    }

    // public function adminChats()
    // {
    //     return $this->hasMany(Chat::class, 'admin_id');
    // }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    // Check if user is admin
    public function isAdmin(): bool
    {
        return $this->is_admin;
    }

    // Get the admin for this user's account
    public function getAdminAttribute(): Admin
    {
        return $this->account?->admin;
    }

    // Get users under this admin
    public function managedUsers(): User|Collection
    {
        $users = User::whereHas('account', fn($q) => $q->where('admin_id', $this->id))->get();
        $users->load('account'); // Eager-load on the collection
        return $users;
    }

    public function sendEmailVerificationNotification()
    {
        $this->notify(new CustomVerifyEmail);
    }

    public function paymentHistoryQuery()
    {
        // Get closed trades (profit/loss)
        $trades = $this->trades()
            ->where('status', 'closed')
            ->selectRaw('
                id as reference_id,
                CASE WHEN profit_loss >= 0 THEN "profit" ELSE "loss" END as type,
                profit_loss as amount,
                COALESCE(closed_at, updated_at) as date,
                "trade" as source
            ');

        // Get deposits
        $deposits = $this->deposits()
            ->selectRaw('
                id as reference_id,
                "deposit" as type,
                amount,
                created_at as date,
                "deposit" as source
            ');

        // Get withdrawals
        $withdrawals = $this->withdrawals()
            ->selectRaw('
                id as reference_id,
                "withdrawal" as type,
                amount,
                created_at as date,
                "withdrawal" as source
            ');

        // Union all queries
        $query = $trades->unionAll($deposits)->unionAll($withdrawals);

        // Return as a query builder so you can paginate
        return DB::query()->fromSub($query, 'payment_history')->orderByDesc('date');
    }

    public function loginActivities()
    {
        return $this->hasMany(UserSession::class)->with(['device']);
    }
}
