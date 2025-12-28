<?php

namespace App\Services;

use App\Models\User;
use App\Models\Notification;
use App\Models\Deposit;
use App\Models\Withdrawal;
use App\Models\Account;
use App\Models\HdWallet;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    // Allowed notification types
    public const ALLOWED_TYPES = [
        'deposit',
        'withdrawal',
        'trade',
        'system',
        'security',
        'profit',
        'announcement',
    ];
    /**
     * Create a notification for a user
     */
    protected function createNotification(
        User $user,
        string $type,
        string $title,
        string $message,
        ?array $metadata = null
    ): Notification {
        // Normalize and validate notification type
        $type = $this->normalizeType($type);
        Log::info('[NotificationService] Creating notification', [
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
        ]);

        return $user->notifications()->create([
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'is_read' => false,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Normalize notification type to allowed types. Unknown types are mapped to 'system'.
     */
    protected function normalizeType(string $type): string
    {
        $type = strtolower(trim($type));
        if (in_array($type, self::ALLOWED_TYPES, true)) {
            return $type;
        }

        Log::warning('[NotificationService] Unknown notification type, mapping to system', ['type' => $type]);
        return 'system';
    }

    public function notifyAdminNewUser(User $admin, User $newUser): Notification
    {
        $title   = 'New User Registered';
        $message = "A new user, {$newUser->name} ({$newUser->email}), has just registered on the platform.";

        return $this->createNotification($admin, 'user', $title, $message, [
            'action'    => 'new_user_registered',
            'user_id'   => $newUser->id,
            'user_name' => $newUser->name,
            'user_email' => $newUser->email,
        ]);
    }

    public function notifyWelcome(User $user): Notification
    {
        $title   = 'Welcome to Our Platform!';
        $message = "Welcome aboard, {$user->name}! We’re excited to have you join us. Explore your dashboard and start enjoying our services.";

        return $this->createNotification($user, 'welcome', $title, $message, [
            'action'  => 'welcome_user',
            'user_id' => $user->id,
        ]);
    }

    public function notifyGetRegisterRewards(User $user): Notification
    {
        $title   = 'Registration Reward Unlocked!';
        $message = "Congratulations, {$user->name}! You’ve received a registration reward of \$2,000 credited to your account.";

        return $this->createNotification($user, 'reward', $title, $message, [
            'action'   => 'register_reward',
            'user_id'  => $user->id,
            'reward'   => 2000,
            'currency' => 'USD',
        ]);
    }

    /**
     * Send welcome notification when user is created
     */
    public function notifyUserCreated(User $user): Notification
    {
        $title = 'Welcome to Our Platform!';
        $message = "Hello {$user->name}, your account has been successfully created. We're excited to have you on board!";

        return $this->createNotification($user, 'system', $title, $message, [
            'action' => 'user_created',
            'user_id' => $user->id,
        ]);
    }

    /**
     * Notify user when wallet is created
     */
    public function notifyWalletCreated(User $user): Notification
    {
        $title = 'HD Wallet Created Successfully';
        $message = "Your secure HD wallet has been created successfully! You can now manage multiple crypto chains from a single wallet.";

        return $this->createNotification($user, 'system', $title, $message, [
            'action' => 'hd_wallet_created',
            'user_id' => $user->id,
        ]);
    }

    /**
     * Notify user when wallet creation fails
     */
    public function notifyWalletCreationFailed(User $user): Notification
    {
        $title = 'Wallet Creation Issue';
        $message = "We're experiencing technical difficulties creating your wallet. Our team is working on it and will notify you once it's resolved. You can still use the platform normally.";

        return $this->createNotification($user, 'system', $title, $message, [
            'action' => 'hd_wallet_creation_failed',
            'user_id' => $user->id,
        ]);
    }

    /**
     * Notify admin when wallet creation fails
     */
    public function notifyAdminWalletCreationFailed($admin, int $accountId, int $userId, string $errorMessage): Notification
    {
        $title = 'HD Wallet Creation Failed';
        $message = "Failed to create HD wallet for user ID {$userId} (Account ID: {$accountId}). Error: {$errorMessage}. Manual intervention may be required.";

        return $this->createNotification($admin, 'system', $title, $message, [
            'action' => 'admin_wallet_creation_failed',
            'account_id' => $accountId,
            'user_id' => $userId,
            'error' => $errorMessage,
        ]);
    }


    /**
     * Notify user when deposit is initiated
     */
    public function notifyDepositInitiated(User $user, Deposit $deposit): Notification
    {
        $amount = number_format($deposit->amount, 2);
        $asset = $deposit->asset->name ?? 'Crypto';

        $title = 'Deposit Initiated';
        $message = "Your deposit of {$amount} {$asset} has been initiated and is awaiting blockchain confirmation.";

        return $this->createNotification($user, 'deposit', $title, $message, [
            'action' => 'deposit_initiated',
            'deposit_id' => $deposit->id,
            'amount' => $deposit->amount,
            'asset' => $asset,
            'status' => $deposit->status,
        ]);
    }

    /**
     * Notify user when deposit is confirmed
     */
    public function notifyDepositConfirmed(User $user, Deposit $deposit): Notification
    {
        $amount = number_format($deposit->amount, 2);
        $asset = $deposit->asset->name ?? 'Crypto';

        $title = 'Deposit Confirmed';
        $message = "Great news! Your deposit of {$amount} {$asset} has been confirmed and credited to your account.";

        return $this->createNotification($user, 'deposit', $title, $message, [
            'action' => 'deposit_confirmed',
            'deposit_id' => $deposit->id,
            'amount' => $deposit->amount,
            'asset' => $asset,
            'tx_hash' => $deposit->transaction_hash,
        ]);
    }

    public function notifyDepositMismatch(User $user, Deposit $deposit, float $actualAmount): Notification
    {
        $expected = number_format($deposit->amount, 2);
        $actualAmount     = number_format($actualAmount, 2);
        $asset        = $deposit->asset->name ?? 'Crypto';

        $title   = 'Deposit Mismatch Detected';
        $message = "We noticed a mismatch in your deposit. You sent {$actualAmount} {$asset}, 
                but the expected amount was {$expected} {$asset}. However your account has been credited with the correct amount.";

        return $this->createNotification($user, 'deposit', $title, $message, [
            'action'      => 'deposit_mismatch',
            'deposit_id'  => $deposit->id,
            'expected'    => $expected,
            'received'    => $actualAmount,
            'asset'       => $asset,
            'tx_hash'     => $deposit->transaction_hash,
        ]);
    }

    /**
     * Notify user when deposit fails
     */
    public function notifyDepositFailed(User $user, Deposit $deposit, string $reason = 'Unknown error'): Notification
    {
        $amount = number_format($deposit->amount, 2);
        $asset = $deposit->asset->name ?? 'Crypto';

        $title = 'Deposit Failed';
        $message = "Unfortunately, your deposit of {$amount} {$asset} has failed. Reason: {$reason}. Please contact support if you need assistance.";

        return $this->createNotification($user, 'deposit', $title, $message, [
            'action' => 'deposit_failed',
            'deposit_id' => $deposit->id,
            'amount' => $deposit->amount,
            'reason' => $reason,
        ]);
    }

    public function notifyAdminDepositAlert(Deposit $deposit): Notification|null
    {
        $user = $deposit->user;
        $amount = number_format($deposit->amount, 2);
        $asset = $deposit->asset->name ?? 'Crypto';

        $title = 'New Deposit Alert';
        $message = "User {$user->name} (ID: {$user->id}) has made a deposit of {$amount} {$asset}. Please review and confirm.";

        // Assuming there's an admin user or a way to notify admins
        $adminUser = $user->account->admin->user() ?? User::where('is_admin', true)->first();

        if ($adminUser) {
            return $this->createNotification($adminUser, 'admin', $title, $message, [
                'action' => 'admin_deposit_alert',
                'deposit_id' => $deposit->id,
                'user_id' => $user->id,
                'amount' => $deposit->amount,
                'asset' => $asset,
            ]);
        }

        Log::warning('[NotificationService] No admin user found for deposit alert', [
            'deposit_id' => $deposit->id,
            'user_id' => $user->id,
        ]);

        return null;
    }

    /**
     * Notify user when withdrawal is requested
     */
    public function notifyWithdrawalRequested(User $user, Withdrawal $withdrawal): Notification
    {
        $amount = number_format($withdrawal->amount, 2);
        $asset = $withdrawal->asset->name ?? 'Crypto';

        $title = 'Withdrawal Requested';
        $message = "Your withdrawal request for {$amount} {$asset} has been received and is pending approval.";

        return $this->createNotification($user, 'withdrawal', $title, $message, [
            'action' => 'withdrawal_requested',
            'withdrawal_id' => $withdrawal->id,
            'amount' => $withdrawal->amount,
            'asset' => $asset,
            'status' => $withdrawal->status,
        ]);
    }

    /**
     * Notify user when withdrawal is approved
     */
    public function notifyWithdrawalApproved(User $user, Withdrawal $withdrawal): Notification
    {
        $amount = number_format($withdrawal->amount, 2);
        $asset = $withdrawal->asset->name ?? 'Crypto';

        $title = 'Withdrawal Approved';
        $message = "Your withdrawal of {$amount} {$asset} has been approved and is being processed.";

        return $this->createNotification($user, 'withdrawal', $title, $message, [
            'action' => 'withdrawal_approved',
            'withdrawal_id' => $withdrawal->id,
            'amount' => $withdrawal->amount,
            'asset' => $asset,
        ]);
    }

    /**
     * Notify user when withdrawal is completed
     */
    public function notifyWithdrawalCompleted(User $user, Withdrawal $withdrawal): Notification
    {
        $amount = number_format($withdrawal->final_amount, 2);
        $asset = $withdrawal->asset->name ?? 'Crypto';

        $title = 'Withdrawal Completed';
        $message = "Your withdrawal of {$amount} {$asset} has been completed successfully and sent to your specified address.";

        return $this->createNotification($user, 'withdrawal', $title, $message, [
            'action' => 'withdrawal_completed',
            'withdrawal_id' => $withdrawal->id,
            'amount' => $withdrawal->final_amount,
            'asset' => $asset,
            'tx_hash' => $withdrawal->transaction_hash,
        ]);
    }

    /**
     * Notify user when withdrawal fails
     */
    public function notifyWithdrawalFailed(User $user, Withdrawal $withdrawal, string $reason = 'Unknown error'): Notification
    {
        $amount = number_format($withdrawal->amount, 2);
        $asset = $withdrawal->asset->name ?? 'Crypto';

        $title = 'Withdrawal Failed';
        $message = "Your withdrawal of {$amount} {$asset} has failed. Reason: {$reason}. The amount has been returned to your account.";

        return $this->createNotification($user, 'withdrawal', $title, $message, [
            'action' => 'withdrawal_failed',
            'withdrawal_id' => $withdrawal->id,
            'amount' => $withdrawal->amount,
            'reason' => $reason,
        ]);
    }

    /**
     * Notify user when withdrawal is cancelled
     */
    public function notifyWithdrawalCancelled(User $user, Withdrawal $withdrawal, string $reason = 'Cancelled by admin'): Notification
    {
        $amount = number_format($withdrawal->amount, 2);
        $asset = $withdrawal->asset->name ?? 'Crypto';

        $title = 'Withdrawal Cancelled';
        $message = "Your withdrawal of {$amount} {$asset} has been cancelled. Reason: {$reason}. The amount has been returned to your account.";

        return $this->createNotification($user, 'withdrawal', $title, $message, [
            'action' => 'withdrawal_cancelled',
            'withdrawal_id' => $withdrawal->id,
            'amount' => $withdrawal->amount,
            'reason' => $reason,
        ]);
    }

    /**
     * Notify user when balance reaches a certain threshold
     */
    public function notifyBalanceThreshold(
        User $user,
        float $currentBalance,
        float $threshold,
        string $comparison = 'above'
    ): Notification {
        $formattedBalance = number_format($currentBalance, 2);
        $formattedThreshold = number_format($threshold, 2);

        $title = $comparison === 'above'
            ? 'Balance Milestone Reached!'
            : 'Low Balance Alert';

        $message = $comparison === 'above'
            ? "Congratulations! Your account balance has reached {$formattedBalance}, exceeding your {$formattedThreshold} milestone."
            : "Notice: Your account balance ({$formattedBalance}) has fallen below {$formattedThreshold}. Consider adding funds to continue trading.";

        return $this->createNotification($user, 'system', $title, $message, [
            'action' => 'balance_threshold',
            'current_balance' => $currentBalance,
            'threshold' => $threshold,
            'comparison' => $comparison,
        ]);
    }

    /**
     * Notify user about profit milestone
     */
    public function notifyProfitMilestone(User $user, float $totalProfit): Notification
    {
        $formattedProfit = number_format($totalProfit, 2);

        $title = 'Profit Milestone Achieved!';
        $message = "Amazing! Your total profit has reached {$formattedProfit}. Keep up the great trading!";

        return $this->createNotification($user, 'profit', $title, $message, [
            'action' => 'profit_milestone',
            'total_profit' => $totalProfit,
        ]);
    }

    /**
     * Notify user about trade completion
     */
    public function notifyTradeCompleted(User $user, $trade): Notification
    {
        $amount = number_format($trade->amount, 2);
        $profitLoss = number_format($trade->profit_loss, 2);
        $isProfit = $trade->profit_loss >= 0;

        $title = $isProfit ? 'Trade Closed - Profit!' : 'Trade Closed - Loss';
        $message = $isProfit
            ? "Your trade of {$amount} has closed with a profit of {$profitLoss}. Well done!"
            : "Your trade of {$amount} has closed with a loss of {$profitLoss}. Better luck next time!";

        return $this->createNotification($user, 'trade', $title, $message, [
            'action' => 'trade_completed',
            'trade_id' => $trade->id,
            'amount' => $trade->amount,
            'profit_loss' => $trade->profit_loss,
            'is_profit' => $isProfit,
        ]);
    }

    /**
     * Notify user about security event
     */
    public function notifySecurityEvent(User $user, string $eventType, string $details): Notification
    {
        $title = 'Security Alert';
        $message = "Security event detected: {$eventType}. {$details}";

        return $this->createNotification($user, 'security', $title, $message, [
            'action' => 'security_event',
            'event_type' => $eventType,
            'details' => $details,
        ]);
    }

    /**
     * Notify user about login from new device
     */
    public function notifyNewDeviceLogin(User $user, string $ipAddress, string $userAgent): Notification
    {
        $title = 'New Device Login Detected';
        $message = "A login to your account was detected from a new device. IP: {$ipAddress}. If this wasn't you, please secure your account immediately.";

        return $this->createNotification($user, 'security', $title, $message, [
            'action' => 'new_device_login',
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
        ]);
    }

    /**
     * Send system announcement to user
     */
    public function notifyAnnouncement(User $user, string $title, string $message): Notification
    {
        return $this->createNotification($user, 'announcement', $title, $message, [
            'action' => 'announcement',
        ]);
    }

    /**
     * Send system announcement to all users
     */
    public function notifyAllUsers(string $title, string $message): int
    {
        $count = 0;
        User::chunk(100, function ($users) use ($title, $message, &$count) {
            foreach ($users as $user) {
                $this->notifyAnnouncement($user, $title, $message);
                $count++;
            }
        });

        Log::info('[NotificationService] Announcement sent to all users', [
            'total_users' => $count,
            'title' => $title,
        ]);

        return $count;
    }

    /**
     * Check and notify if balance exceeds threshold
     */
    public function checkAndNotifyBalanceThreshold(User $user, float $threshold, string $comparison = 'above'): ?Notification
    {
        $account = $user->account;

        if (!$account) {
            return null;
        }

        $currentBalance = $account->total_balance;
        $shouldNotify = $comparison === 'above'
            ? $currentBalance >= $threshold
            : $currentBalance <= $threshold;

        if ($shouldNotify) {
            return $this->notifyBalanceThreshold($user, $currentBalance, $threshold, $comparison);
        }

        return null;
    }

    /**
     * Notify user about account status change
     */
    public function notifyAccountStatusChange(User $user, string $oldStatus, string $newStatus, ?string $reason = null): Notification
    {
        $title = 'Account Status Updated';
        $message = "Your account status has been changed from '{$oldStatus}' to '{$newStatus}'.";

        if ($reason) {
            $message .= " Reason: {$reason}";
        }

        return $this->createNotification($user, 'system', $title, $message, [
            'action' => 'account_status_change',
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'reason' => $reason,
        ]);
    }
}
