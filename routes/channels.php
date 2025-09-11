<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('chat.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

Broadcast::channel('admin.chat.{adminId}', function ($user, $adminId) {
    return $user->isAdmin() && (int) $user->id === (int) $adminId;
});

Broadcast::channel('admin.notifications.{adminId}', function ($user, $adminId) {
    return $user->isAdmin() && (int) $user->id === (int) $adminId;
});
