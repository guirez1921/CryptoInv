<?php

use App\Http\Controllers\ChatController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Home');
})->name("home");

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');


    Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');
    Route::post('/chat', [ChatController::class, 'store'])->name('chat.store');
    Route::patch('/chat/{chat}/read', [ChatController::class, 'markAsRead'])->name('chat.read');
    Route::get('/chat/conversation/{userId}', [ChatController::class, 'getConversation'])->name('chat.conversation');
});

require __DIR__.'/auth.php';