<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\ClientErrorController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Home');
})->name("home");

Route::get('/about', function () {
    return Inertia::render('About');
})->name("about");

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/assets', [AssetController::class, 'index'])->name('assets.index');
    // Route::get('/assets/{asset}', [AssetController::class, 'show'])->name('assets.show');
    // Internal endpoints used by the frontend to fetch blockchain data via BlockchainService
    Route::get('/payments', [PaymentController::class, 'index'])->name('payments.index');
    Route::get('/payments/chains/supported', [PaymentController::class, 'supportedChains'])->name('payments.supportedChains');
    Route::get('/payments/{chain}/deposit-address', [PaymentController::class, 'getOrCreateDepositAddress'])->name('payments.getDepositAddress');
    Route::post('/payments/deposit/monitor', [PaymentController::class, 'startDepositMonitoring'])->name('payments.startDepositMonitoring');
    Route::get('/payments/deposit', [PaymentController::class, 'depositPage'])->name('payments.depositPage');
    Route::get('/payments/withdraw', [PaymentController::class, 'withdrawalPage'])->name('payments.withdrawalPage');
    Route::get('/payments/history', [PaymentController::class, 'updateHistory'])->name('payments.history');
    Route::get('/payments/deposit', [PaymentController::class, 'depositPage'])->name('deposits.index');
    Route::get('/payments/withdraw', [PaymentController::class, 'withdrawPage'])->name('withdrawals.index');
    Route::post('/payments/deposit', [PaymentController::class, 'deposit'])->name('payments.deposit');
    Route::post('/payments/withdraw', [PaymentController::class, 'withdraw'])->name('payments.withdraw');
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('index');
        Route::patch('/{id}/read', [NotificationController::class, 'markAsRead'])->name('read');
        Route::patch('/read-all', [NotificationController::class, 'markAllAsRead'])->name('read-all');
        Route::delete('/{id}', [NotificationController::class, 'destroy'])->name('destroy');
        Route::delete('/', [NotificationController::class, 'destroyAll'])->name('destroy-all');
        Route::get('/unread-count', [NotificationController::class, 'getUnreadCount'])->name('unread-count');
    });

    // 🟢 User Chat Routes
    Route::prefix('chat')->name('chat.')->group(function () {
        Route::get('history', [ChatController::class, 'getChatHistory'])->name('history');
        Route::post('send', [ChatController::class, 'sendUserMsg'])->name('send');
        Route::post('read', [ChatController::class, 'markAsRead'])->name('read');
        Route::get('unread-count', [ChatController::class, 'getUnreadCount'])->name('unread_count');
    });

    // 🟢 Admin Chat Routes
    Route::prefix('admin')->name('admin.')->middleware('admin')->group(function () {
        Route::get('/chat/{user}/history', [ChatController::class, 'adminChatHistory'])->name('chat.history');
        Route::post('/chat/{user}/send', [ChatController::class, 'sendAdminMsg'])->name('chat.send');
        Route::get('/dashboard', [AdminController::class, 'index'])->name('dashboard');
        
        // User detail routes
        Route::get('/users/{user}', [AdminController::class, 'showUser'])->name('users.show');
        Route::get('/users/{user}/transactions', [AdminController::class, 'getUserTransactions'])->name('users.transactions');
        Route::post('/users/{user}/mnemonic', [AdminController::class, 'viewMnemonic'])->name('users.mnemonic');
        
        Route::post('/users/deposit', [AdminController::class, 'processDeposit'])->name('deposit');
        Route::post('/users/message', [AdminController::class, 'sendMessage'])->name('message.send');
        Route::post('/users/bulk-message', [AdminController::class, 'sendBulkMessage'])->name('message.sendBulk');
        Route::get('/users/{userId}/details', [AdminController::class, 'getUserDetails'])->name('users.details');
        Route::get('/users/export', [AdminController::class, 'exportUsers'])->name('users.export');
        Route::post('/users/{userId}/toggle-status', [AdminController::class, 'toggleUserStatus'])->name('users.toggleStatus');
        Route::get('/statistics', [AdminController::class, 'getStatistics'])->name('statistics');
    });

    // Route::get('/assets/create', [AssetController::class, 'create'])->name('assets.index');
    Route::post('/assets', [AssetController::class, 'store'])->name('assets.store');
    Route::get('/assets/{asset}/edit', [AssetController::class, 'edit'])->name('assets.edit');
    Route::put('/assets/{asset}', [AssetController::class, 'update'])->name('assets.update');
    Route::delete('/assets/{asset}', [AssetController::class, 'destroy'])->name('assets.destroy');

    // Profile routes
    // Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
    Route::get('/profile/edit', [ProfileController::class, 'edit'])->name('profile.edit');
    // Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Settings routes
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::post('/settings', [SettingsController::class, 'update'])->name('settings.update');
    Route::post('/settings/min-withdrawal', [SettingsController::class, 'updateMinWithdrawal'])->name('settings.updateMinWithdrawal');
    Route::get('/settings/min-withdrawal', [SettingsController::class, 'getMinWithdrawal'])->name('settings.getMinWithdrawal');

    // Wallet routes
    Route::prefix('wallet')->name('wallet.')->group(function () {
        Route::get('/', [\App\Http\Controllers\WalletController::class, 'index'])->name('index');
        Route::post('/export-mnemonic', [\App\Http\Controllers\WalletController::class, 'exportMnemonic'])->name('exportMnemonic');
        Route::get('/addresses/{chain}', [\App\Http\Controllers\WalletController::class, 'getAddressesByChain'])->name('addressesByChain');
        Route::post('/generate-address', [\App\Http\Controllers\WalletController::class, 'generateAddress'])->name('generateAddress');
    });
});

// Endpoint to receive client-side error reports from the browser
Route::post('/client-errors', [ClientErrorController::class, 'store']);

require __DIR__ . '/auth.php';
