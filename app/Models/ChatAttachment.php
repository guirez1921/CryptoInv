<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatAttachment extends Model
{
    protected $fillable = [
        'chat_id',
        'file_path',
        'file_type',       // image, pdf, doc, etc.
        'file_size',
    ];

    public function chat()
    {
        return $this->belongsTo(Chat::class);
    }
}
