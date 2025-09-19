<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Session extends Model
{
    //
    protected $table = 'sessions'; // Laravel's default session table
    public $incrementing = false;  // Because the primary key is a string
    protected $keyType = 'string'; // Session ID is a string

    protected $fillable = [
        'id',
        'user_id',
        'ip_address',
        'user_agent',
        'payload',
        'last_activity',
    ];

    public $timestamps = false; // Laravel's session table doesn't use timestamps

}
