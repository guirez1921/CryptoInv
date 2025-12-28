<?php

namespace App\Jobs;

use App\Models\Account;
use App\Models\Admin;
use App\Services\BlockchainService;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CreateHDWalletJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     *
     * @var array
     */
    public $backoff = [30, 120, 300]; // 30s, 2min, 5min

    /**
     * The account ID for which to create the wallet
     *
     * @var int
     */
    protected $accountId;

    /**
     * The user ID (for notifications)
     *
     * @var int
     */
    protected $userId;

    /**
     * Create a new job instance.
     */
    public function __construct(int $accountId, int $userId)
    {
        $this->accountId = $accountId;
        $this->userId = $userId;
    }

    /**
     * Execute the job.
     */
    public function handle(BlockchainService $blockchain, NotificationService $notification): void
    {
        $attemptNumber = $this->attempts();
        
        Log::info("[CreateHDWalletJob] Starting wallet creation", [
            'account_id' => $this->accountId,
            'user_id' => $this->userId,
            'attempt' => $attemptNumber,
        ]);

        try {
            // Call the blockchain service to create HD wallet
            $result = $blockchain->createHDWallet($this->accountId);

            Log::info("[CreateHDWalletJob] Successfully created HD wallet", [
                'account_id' => $this->accountId,
                'user_id' => $this->userId,
                'wallet_id' => $result['walletId'] ?? null,
                'attempt' => $attemptNumber,
            ]);

            // Mark the account's HD wallet creation as complete if you're tracking it
            $account = Account::find($this->accountId);
            if ($account && $account->hdWallet) {
                $account->hdWallet->update([
                    'verified_at' => now(),
                    'is_active' => true,
                ]);
            }

            // Send success notification to user
            if ($account && $account->user) {
                $notification->notifyWalletCreated($account->user);
            }

        } catch (\Exception $e) {
            Log::error("[CreateHDWalletJob] Failed to create HD wallet", [
                'account_id' => $this->accountId,
                'user_id' => $this->userId,
                'attempt' => $attemptNumber,
                'max_attempts' => $this->tries,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // If this is the last attempt, notify admin
            if ($attemptNumber >= $this->tries) {
                $this->handleFinalFailure($notification, $e);
            }

            // Re-throw the exception to trigger retry
            throw $e;
        }
    }

    /**
     * Handle the final failure after all retries
     */
    protected function handleFinalFailure(NotificationService $notification, \Exception $e): void
    {
        Log::critical("[CreateHDWalletJob] All retry attempts exhausted", [
            'account_id' => $this->accountId,
            'user_id' => $this->userId,
            'error' => $e->getMessage(),
        ]);

        // Notify admin about the failure
        $admin = Admin::first();
        if ($admin) {
            $notification->notifyAdminWalletCreationFailed($admin, $this->accountId, $this->userId, $e->getMessage());
        }

        // Optionally notify the user that there was an issue
        $account = Account::find($this->accountId);
        if ($account && $account->user) {
            $notification->notifyWalletCreationFailed($account->user);
        }
    }

    /**
     * Handle job failure (called when all retries are exhausted)
     */
    public function failed(\Throwable $exception): void
    {
        Log::critical("[CreateHDWalletJob] Job failed permanently", [
            'account_id' => $this->accountId,
            'user_id' => $this->userId,
            'error' => $exception->getMessage(),
        ]);
    }
}
