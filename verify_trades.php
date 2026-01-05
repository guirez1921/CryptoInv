<?php

use App\Models\User;
use App\Models\Trade;
use App\Models\Account;
use App\Jobs\AutoCreateTradesJob;
use App\Jobs\CloseExpiredTradesJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->handle(Request::capture());

try {
    $user = User::has('account')->first();
    if (!$user) {
        echo "No user with an account found. Creating one for testing...\n";
        $user = User::first() ?? User::factory()->create();
        Account::create([
            'user_id' => $user->id,
            'total_balance' => 1000,
            'available_balance' => 1000,
        ]);
        $user->refresh();
    }

    echo "Testing with User ID: {$user->id} ({$user->email})\n";
    echo "Initial Account Balance: " . $user->account->available_balance . "\n";

    DB::beginTransaction();
    try {
        // 1. Test AutoCreateTradesJob
        echo "Running AutoCreateTradesJob...\n";
        (new AutoCreateTradesJob())->handle();
        
        $trades = Trade::where('user_id', $user->id)->where('status', 'active')->get();
        echo "Active trades created: " . $trades->count() . "\n";
        foreach ($trades as $t) {
            echo " - Trade ID: {$t->id}, Amount: {$t->amount}, Strategy: {$t->strategy}, Duration: {$t->duration_minutes}m\n";
            // Mock expiration
            $t->update(['opened_at' => now()->subHours(10)]);
        }

        // 2. Test CloseExpiredTradesJob
        echo "Running CloseExpiredTradesJob...\n";
        (new CloseExpiredTradesJob())->handle();

        $closedTrades = Trade::where('user_id', $user->id)
            ->where('status', 'closed')
            ->whereIn('id', $trades->pluck('id'))
            ->get();

        echo "Trades settled: " . $closedTrades->count() . "\n";
        foreach ($closedTrades as $t) {
            echo " - Trade ID: {$t->id}, P/L: {$t->profit_loss}, Status: {$t->status}\n";
        }

        $account = $user->refresh()->account;
        echo "Final Account Balance: " . $account->available_balance . "\n";
        echo "Account Realized PNL: " . $account->realized_pnl . "\n";

        DB::rollBack();
        echo "Verification Complete (Changes Rolled Back).\n";
    } catch (\Exception $e) {
        DB::rollBack();
        echo "Error: " . $e->getMessage() . "\n";
    }
} catch (\Exception $e) {
    echo "Bootstrap Error: " . $e->getMessage() . "\n";
}
