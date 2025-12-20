<?php

namespace App\Services;

use App\Models\Deposit;
use App\Models\UserAsset;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DepositService
{
    private NotificationService $notification;

    public function __construct(NotificationService $notification)
    {
        $this->notification = $notification;
    }

    public function confirmDeposit(Deposit $deposit, float $amount): void
    {
        $depositAmount = $deposit->amount;

        $wallet = Wallet::where('address', $deposit->deposit_address)
            ->where('chain', $deposit->chain)
            ->first();

        if ($wallet) {
            $wallet->increment('balance', $amount);
        }

        if ($amount != $depositAmount) {
            // Log a warning if the amounts do not match
            Log::warning('Deposit amount mismatch', [
                'expected' => $depositAmount,
                'actual' => $amount,
                'deposit_id' => $deposit->id,
            ]);
            $this->notification->notifyDepositMismatch($deposit->user, $deposit, $amount);
        } else {
            Log::info('Deposit amount confirmed', [
                'amount' => $amount,
                'deposit_id' => $deposit->id,
            ]);
            $this->notification->notifyDepositConfirmed($deposit->user, $deposit);
        }

        $deposit->status = 'confirmed';
        $deposit->confirmed_at = now();
        $deposit->save();

        $account = $deposit->user->account;
        if ($account) {
            $account->increment('total_balance', $amount);
            $account->increment('available_balance', $amount);
            $account->increment('total_deposits', $amount);
        }

        UserAsset::handleDeposit($deposit);

        $this->notification->notifyAdminDepositAlert($deposit);
    }
}
