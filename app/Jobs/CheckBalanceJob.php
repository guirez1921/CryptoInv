<?php

namespace App\Jobs;

use App\Services\DepositService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CheckBalanceJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $address;
    public $chain;
    public $duration; // in minutes
    public $deposit;
    private DepositService $depositService;

    public function __construct(\App\Models\Deposit $deposit, $duration = 5)
    {
        $this->address = $deposit->getAddress();
        $this->chain = $deposit->chain;
        $this->duration = $duration;
        $this->deposit = $deposit;
    }

    public function handle(\App\Services\DepositService $depositService)
    {
        $this->depositService = $depositService;
        $end = now()->addMinutes($this->duration);

        while (now()->lt($end)) {
            // 🔄 Call your balance service
            $balance = app(\App\Services\BlockchainService::class)
                ->checkBalance($this->address, $this->chain);

            $wallet = \App\Models\Wallet::where('address', $this->address)
                ->where('chain', $this->chain)
                ->first();


            if ($wallet && $wallet->balance < $balance) {
                $updatedAmount = $wallet->balance < $balance ? $balance - $wallet->balance : 0;
                // broadcast(new \App\Events\Deposit($wallet, $balance - $wallet->balance));
                $this->depositService->confirmDeposit($this->deposit, $updatedAmount);
                Log::info("New deposit detected for wallet {$wallet->id}: " . $updatedAmount);
            }

            Log::info("Balance check: {$this->address} on {$this->chain} = {$balance}");

            // sleep 15 seconds
            sleep(15);
        }
    }
}
