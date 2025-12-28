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
        'email_verified_at',
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
    
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function deposits()
    {
        return $this->account->deposits();
    }

    public function withdrawals()
    {
        return $this->account->withdrawals();
    }

    public function trades()
    {
        return $this->account->trades();
    }

    public function userAssets()
    {
        return $this->hasMany(UserAsset::class);
    }

    public function assets()
    {
        return $this->belongsToMany(Asset::class, 'user_assets')
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

    // Check if user is admin
    public function isAdmin(): bool
    {
        return $this->adminProfile()->exists();
    }

    public function adminProfile(): HasOne
    {
        return $this->hasOne(Admin::class);
    }

    // Get the admin for this user's account
    public function getAdminAttribute(): Admin
    {
        return $this->account?->admin;
    }

    // Accessor for user balance to sync with header
    public function getBalanceAttribute()
    {
        return $this->account?->available_balance ?? 0;
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

    public function loginActivities()
    {
        return $this->hasMany(UserSession::class)->with(['device']);
    }
}
