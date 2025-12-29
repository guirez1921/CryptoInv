<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\User;
use App\Models\Account;
use App\Models\BlockchainTransaction;
use App\Models\Chat;
use App\Models\UserMessage;
use App\Models\Notification;
use App\Services\BlockchainService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    /**
     * Create a new controller instance.
     */

    /**
     * Display the admin dashboard.
     */
    public function index(): Response
    {
        // Get all users with their account data
        $users = Auth::user()->managedUsers(); // returns Eloquent Collection

        $users->load('account'); // eager-load 'account' relationship

        $users = $users->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
                'total_balance' => $user->account?->total_balance ?? 0,
                'available_balance' => $user->account?->available_balance ?? 0,
                'created_at' => $user->created_at,
            ];
        });


        // Calculate dashboard statistics
        $stats = [
            'totalUsers' => $users->count(),
            'activeUsers' => $users->count(),
            'totalBalance' => Account::sum('total_balance'),
            'pendingWithdrawals' => BlockchainTransaction::where('type', 'withdrawal')
                ->where('status', 'pending')
                ->count(),

        ];

        return Inertia::render('Admin/Index', [
            'users' => $users,
            'stats' => $stats
        ]);
    }

    /**
     * Display detailed view of a single user
     */
    public function showUser($userId): Response
    {
        $user = User::with([
            'account.hdWallet.addresses',
            'account.transactions' => function ($query) {
                $query->latest()->limit(10);
            }
        ])->findOrFail($userId);

        // Get wallet data
        $walletData = null;
        if ($user->account && $user->account->hdWallet) {
            $hdWallet = $user->account->hdWallet;
            $addresses = $hdWallet->addresses;

            // Group addresses by chain
            $groupedAddresses = $addresses->groupBy('chain')->map(function ($chainAddresses, $chain) {
                return [
                    'chain' => $chain,
                    'addresses' => $chainAddresses->map(function ($address) {
                        return [
                            'id' => $address->id,
                            'address' => $address->address,
                            'balance' => $address->balance,
                            'asset' => $address->asset,
                            'is_used' => $address->is_used,
                            'created_at' => $address->created_at->format('M d, Y H:i'),
                        ];
                    }),
                    'total_balance' => $chainAddresses->sum('balance'),
                ];
            })->values();

            $walletData = [
                'id' => $hdWallet->id,
                'type' => $hdWallet->type,
                'status' => $hdWallet->status,
                'created_at' => $hdWallet->created_at->format('M d, Y H:i'),
                'is_active' => $hdWallet->is_active,
                'is_locked' => $hdWallet->isLocked(),
                'address_count' => $addresses->count(),
                'total_balance' => $hdWallet->getTotalBalance(),
                'grouped_addresses' => $groupedAddresses,
            ];
        }

        // Format user data
        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'is_active' => $user->is_active,
            'email_verified_at' => $user->email_verified_at?->format('M d, Y H:i'),
            'created_at' => $user->created_at->format('M d, Y H:i'),
            'account' => $user->account ? [
                'id' => $user->account->id,
                'total_balance' => $user->account->total_balance,
                'available_balance' => $user->account->available_balance ?? 0,
                'invested_balance' => $user->account->invested_balance ?? 0,
                'profit_loss' => $user->account->profit_loss ?? 0,
            ] : null,
            'recent_transactions' => $user->account?->transactions->map(function ($tx) {
                return [
                    'id' => $tx->id,
                    'type' => $tx->type,
                    'amount' => $tx->amount,
                    'chain' => $tx->chain,
                    'status' => $tx->status,
                    'tx_hash' => $tx->tx_hash,
                    'created_at' => $tx->created_at->format('M d, Y H:i'),
                ];
            }) ?? [],
        ];

        return Inertia::render('Admin/UserDetail', [
            'user' => $userData,
            'wallet' => $walletData,
        ]);
    }


    /**
     * Process manual deposit for a user.
     */
    public function processDeposit(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'currency' => ['required', 'string', 'in:USD,BTC,ETH,USDT'],
            'note' => ['nullable', 'string', 'max:500']
        ]);

        try {
            DB::beginTransaction();

            $user = User::findOrFail($validated['user_id']);
            $account = $user->account();

            if (!$account) {
                // Create account if it doesn't exist
                $account = Account::create([
                    'user_id' => $user->id,
                    'total_balance' => 0,
                    'available_balance' => 0,
                    'invested_balance' => 0,
                    'profit_loss' => 0
                ]);
            }

            // Convert amount to USD if needed (simplified conversion)
            $usdAmount = $this->convertToUSD($validated['amount'], $validated['currency']);

            // Update account balances
            $account->increment('total_balance', $usdAmount);
            $account->increment('available_balance', $usdAmount);

            // Create Blockchaintransaction record
            BlockchainTransaction::create([
                'account_id' => $account->id,
                'type' => 'deposit',
                'amount' => $validated['amount'],
                'chain' => 'ethereum',
                'status' => 'completed',
                'tx_hash' => null,
                'from_address' => null,
                'to_address' => null,
                'confirmed_at' => now(),
                'metadata' => json_encode([
                    'method' => 'manual_admin',
                    'note' => $validated['note'],
                    'processed_by' => Auth::id(),
                ]),

            ]);

            // Create notification for user
            Notification::create([
                'user_id' => $user->id,
                'type' => 'deposit_completed',
                'title' => 'Deposit Processed',
                'message' => "Your account has been credited with {$validated['currency']} {$validated['amount']} by an administrator.",
                'data' => [
                    'amount' => $validated['amount'],
                    'currency' => $validated['currency'],
                    'processed_by_admin' => true
                ]
            ]);

            // Log admin action
            Log::info('Admin manual deposit processed', [
                'admin_id' => Auth::id(),
                'user_id' => $user->id,
                'amount' => $validated['amount'],
                'currency' => $validated['currency'],
                'usd_amount' => $usdAmount
            ]);

            DB::commit();

            return back()->with('success', "Deposit of {$validated['currency']} {$validated['amount']} added to {$user->name}'s account.");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Admin deposit failed', [
                'admin_id' => Auth::id(),
                'user_id' => $validated['user_id'],
                'error' => $e->getMessage()
            ]);

            throw ValidationException::withMessages([
                'amount' => 'Failed to process deposit. Please try again.'
            ]);
        }
    }

    /**
     * Send message to a single user.
     */
    public function sendMessage(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'subject' => ['required', 'string', 'max:200'],
            'message' => ['required', 'string', 'max:2000'],
            'type' => ['required', 'string', 'in:info,success,warning,error']
        ]);

        try {
            $user = User::findOrFail($validated['user_id']);

            // Create user message
            $chat = Chat::create([
                'user_id' => $user->id,
                'admin_id' => Auth::id(),
                'message' => $validated['message'],
                'message_type' => 'text',
                'status' => 'sent',
                'is_from_admin' => true,
                'is_bot_message' => false,
            ]);

            broadcast(new MessageSent($chat))->toOthers();

            // Create notification
            Notification::create([
                'user_id' => $user->id,
                'type' => 'new_message',
                'title' => 'New Message from Admin',
                'message' => $validated['subject'],
                'data' => [
                    'message_type' => $validated['type'],
                    'from_admin' => true
                ]
            ]);

            // Log admin action
            Log::info('Admin message sent', [
                'admin_id' => Auth::id(),
                'user_id' => $user->id,
                'subject' => $validated['subject'],
                'type' => $validated['type']
            ]);

            return back()->with('success', "Message sent to {$user->name} successfully.");
        } catch (\Exception $e) {
            Log::error('Admin message failed', [
                'admin_id' => Auth::id(),
                'user_id' => $validated['user_id'],
                'error' => $e->getMessage()
            ]);

            throw ValidationException::withMessages([
                'message' => 'Failed to send message. Please try again.'
            ]);
        }
    }

    /**
     * Send bulk message to multiple users.
     */
    public function sendBulkMessage(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_ids' => ['required', 'array', 'min:1'],
            'user_ids.*' => ['integer', 'exists:users,id'],
            'subject' => ['required', 'string', 'max:200'],
            'message' => ['required', 'string', 'max:2000'],
            'type' => ['required', 'string', 'in:info,success,warning,error']
        ]);

        try {
            DB::beginTransaction();

            $users = User::whereIn('id', $validated['user_ids'])->get();
            $messagesCreated = 0;

            foreach ($users as $user) {
                // Create user message
                // UserMessage::create([
                //     'user_id' => $user->id,
                //     'from_admin' => true,
                //     'sender_id' => Auth::id(),
                //     'subject' => $validated['subject'],
                //     'message' => $validated['message'],
                //     'type' => $validated['type'],
                //     'is_read' => false,
                //     'is_bulk' => true
                // ]);

                $chat = Chat::create([
                    'user_id' => $user->id,
                    'admin_id' => Auth::id(),
                    'message' => $validated['message'],
                    'message_type' => 'text',
                    'status' => 'sent',
                    'is_from_admin' => true,
                    'is_bot_message' => false,
                ]);

                broadcast(new MessageSent($chat))->toOthers();

                // Create notification
                Notification::create([
                    'user_id' => $user->id,
                    'type' => 'new_message',
                    'title' => 'New Message from Admin',
                    'message' => $validated['subject'],
                    'data' => [
                        'message_type' => $validated['type'],
                        'from_admin' => true,
                        'is_bulk' => true
                    ]
                ]);

                $messagesCreated++;
            }

            // Log admin action
            Log::info('Admin bulk message sent', [
                'admin_id' => Auth::id(),
                'user_count' => $messagesCreated,
                'subject' => $validated['subject'],
                'type' => $validated['type']
            ]);

            DB::commit();

            return back()->with('success', "Bulk message sent to {$messagesCreated} users successfully.");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Admin bulk message failed', [
                'admin_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            throw ValidationException::withMessages([
                'message' => 'Failed to send bulk message. Please try again.'
            ]);
        }
    }

    /**
     * Get user details with account information.
     */
    public function getUserDetails(Request $request, $userId)
    {
        $user = User::with(['account' => function ($query) {
            $query->latest()->limit(10);
        }, 'transactions' => function ($query) {
            $query->latest()->limit(5);
        }])->findOrFail($userId);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_active' => $user->is_active,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'account' => $user->account ? [
                    'total_balance' => $user->account->total_balance,
                    'available_balance' => $user->account->available_balance,
                    'invested_balance' => $user->account->invested_balance,
                    'profit_loss' => $user->account->profit_loss,
                ] : null,
                'recent_transactions' => $user->account->transactions->map(function ($transaction) {
                    return [
                        'id' => $transaction->id,
                        'type' => $transaction->type,
                        'amount' => $transaction->amount,
                        'currency' => $transaction->currency,
                        'status' => $transaction->status,
                        'created_at' => $transaction->created_at,
                    ];
                })
            ]
        ]);
    }

    /**
     * Export users data to CSV.
     */
    public function exportUsers(Request $request)
    {
        $users = User::with(['account'])
            ->select([
                'id',
                'name',
                'email',
                'is_active',
                'email_verified_at',
                'created_at'
            ])
            ->get();

        $csvData = [];
        $csvData[] = ['ID', 'Name', 'Email', 'Status', 'Verified', 'Total Balance', 'Available Balance', 'Join Date'];

        foreach ($users as $user) {
            $csvData[] = [
                $user->id,
                $user->name,
                $user->email,
                $user->is_active ? 'Active' : 'Inactive',
                $user->email_verified_at ? 'Yes' : 'No',
                $user->account?->total_balance ?? 0,
                $user->account?->available_balance ?? 0,
                $user->created_at->format('Y-m-d H:i:s')
            ];
        }

        $filename = 'users_export_' . now()->format('Y_m_d_H_i_s') . '.csv';

        $output = fopen('php://temp', 'w');
        foreach ($csvData as $row) {
            fputcsv($output, $row);
        }
        rewind($output);
        $csvContent = stream_get_contents($output);
        fclose($output);

        return response($csvContent)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
    }

    /**
     * Toggle user active status.
     */
    public function toggleUserStatus(Request $request, $userId): RedirectResponse
    {
        $user = User::findOrFail($userId);
        $user->update(['is_active' => !$user->is_active]);

        // Create notification
        Notification::create([
            'user_id' => $user->id,
            'type' => 'account_status_changed',
            'title' => 'Account Status Updated',
            'message' => $user->is_active ?
                'Your account has been activated.' :
                'Your account has been deactivated.',
            'data' => [
                'status' => $user->is_active ? 'activated' : 'deactivated',
                'updated_by_admin' => true
            ]
        ]);

        // Log admin action
        Log::info('Admin toggled user status', [
            'admin_id' => Auth::id(),
            'user_id' => $user->id,
            'new_status' => $user->is_active
        ]);

        $status = $user->is_active ? 'activated' : 'deactivated';
        return back()->with('success', "User {$user->name} has been {$status}.");
    }

    /**
     * Get admin statistics.
     */
    public function getStatistics()
    {
        $stats = [
            'users' => [
                'total' => User::count(),
                'active' => User::where('is_active', true)->count(),
                'verified' => User::whereNotNull('email_verified_at')->count(),
                'new_this_month' => User::where('created_at', '>=', now()->startOfMonth())->count()
            ],
            'transactions' => [
                'total_deposits' => BlockchainTransaction::where('type', 'deposit')->where('status', 'completed')->sum('usd_amount'),
                'total_withdrawals' => BlockchainTransaction::where('type', 'withdrawal')->where('status', 'completed')->sum('usd_amount'),
                'pending_withdrawals' => BlockchainTransaction::where('type', 'withdrawal')->where('status', 'pending')->count(),
                'today_deposits' => BlockchainTransaction::where('type', 'deposit')
                    ->where('status', 'completed')
                    ->whereDate('created_at', today())
                    ->sum('usd_amount')
            ],
            'balances' => [
                'total_balance' => Account::sum('total_balance'),
                'available_balance' => Account::sum('available_balance'),
                'invested_balance' => Account::sum('invested_balance'),
                'total_profit' => Account::sum('profit_loss')
            ]
        ];

        return response()->json($stats);
    }

    /**
     * Get user transactions with pagination and filters
     */
    public function getUserTransactions(Request $request, $userId)
    {
        $perPage = $request->input('per_page', 20);
        $type = $request->input('type');
        $chain = $request->input('chain');
        $status = $request->input('status');

        $user = User::findOrFail($userId);
        
        if (!$user->account) {
            return response()->json([
                'transactions' => [],
                'total' => 0,
            ]);
        }

        $query = BlockchainTransaction::where('account_id', $user->account->id);

        if ($type) {
            $query->where('type', $type);
        }

        if ($chain) {
            $query->where('chain', $chain);
        }

        if ($status) {
            $query->where('status', $status);
        }

        $transactions = $query->with(['walletAddress'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'transactions' => $transactions->map(function ($tx) {
                return [
                    'id' => $tx->id,
                    'type' => $tx->type,
                    'amount' => $tx->amount,
                    'chain' => $tx->chain,
                    'status' => $tx->status,
                    'tx_hash' => $tx->tx_hash,
                    'from_address' => $tx->from_address,
                    'to_address' => $tx->to_address,
                    'gas_fee' => $tx->gas_fee,
                    'error_message' => $tx->error_message,
                    'confirmed_at' => $tx->confirmed_at?->format('M d, Y H:i'),
                    'created_at' => $tx->created_at->format('M d, Y H:i'),
                ];
            }),
            'total' => $transactions->total(),
            'current_page' => $transactions->currentPage(),
            'last_page' => $transactions->lastPage(),
        ]);
    }

    /**
     * View wallet mnemonic (admin only, requires password confirmation)
     */
    public function viewMnemonic(Request $request, $userId)
    {
        $validated = $request->validate([
            'password' => ['required', 'string']
        ]);

        // Verify admin password
        if (!\Hash::check($validated['password'], Auth::user()->password)) {
            return response()->json([
                'error' => 'Invalid password. Please confirm your password to view mnemonic.'
            ], 403);
        }

        $user = User::findOrFail($userId);
        $account = $user->account;

        if (! $account || !$account->hdWallet) {
            return response()->json([
                'error' => 'No HD wallet found for this user.'
            ], 404);
        }

        // Get mnemonic from blockchain service
        try {
            $mnemonic = app(BlockchainService::class)->getMnemonic($account->hdWallet->id);

            // Log mnemonic access for audit
            Log::warning('Admin viewed user wallet mnemonic', [
                'admin_id' => Auth::id(),
                'admin_email' => Auth::user()->email,
                'user_id' => $userId,
                'user_email' => $user->email,
                'hd_wallet_id' => $account->hdWallet->id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            return response()->json([
                'success' => true,
                'mnemonic' => $mnemonic,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve mnemonic', [
                'error' => $e->getMessage(),
                'user_id' => $userId
            ]);

            return response()->json([
                'error' => 'Failed to retrieve mnemonic. Please try again.'
            ], 500);
        }
    }

    /**
     * Convert amount to USD (simplified conversion).
     * In production, you would integrate with a real exchange rate API.
     */
    private function convertToUSD(float $amount, string $currency): float
    {
        $rates = [
            'USD' => 1.0,
            'BTC' => 45000.0, // Example rate
            'ETH' => 2800.0,   // Example rate
            'USDT' => 1.0
        ];

        return $amount * ($rates[$currency] ?? 1.0);
    }

    /**
     * Get user wallet addresses with balances
     */
    public function getUserWalletAddresses(Request $request, $userId)
    {
        $user = User::findOrFail($userId);
        $account = $user->account;

        if (!$account || !$account->hdWallet) {
            return response()->json(['addresses' => []]);
        }

        $hdWallet = $account->hdWallet;
        $addresses = $hdWallet->addresses()->get();
        $blockchainService = app(BlockchainService::class);

        $formattedAddresses = $addresses->map(function ($address) use ($blockchainService) {
            // Fetch real-time balance from blockchain
            try {
                $balanceData = $blockchainService->checkBalance(
                    $address->address,
                    $address->chain,
                    $address->asset
                );

                $balance = $balanceData['balance'] ?? 0;

                // Update database with fetched balance
                $address->balance = $balance;
                $address->last_sync_at = now();
                $address->save();

            } catch (\Exception $e) {
                Log::warning('Failed to fetch balance for address', [
                    'address_id' => $address->id,
                    'address' => $address->address,
                    'chain' => $address->chain,
                    'error' => $e->getMessage()
                ]);
                $balance = $address->balance ?? 0;
            }

            return [
                'id' => $address->id,
                'address' => $address->address,
                'chain' => $address->chain,
                'asset' => $address->asset,
                'balance' => $balance,
                'usd_value' => 0,
                'derivation_path' => $address->derivation_path,
                'created_at' => $address->created_at->format('M d, Y H:i'),
                'last_sync_at' => $address->last_sync_at ? $address->last_sync_at->format('M d, Y H:i') : null,
            ];
        });

        return response()->json([
            'success' => true,
            'addresses' => $formattedAddresses
        ]);
    }

    /**
     * Trigger transfer to master wallet
     */
    public function transferToMaster(Request $request)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'address_id' => ['required', 'integer', 'exists:wallet_addresses,id'],
            'chain' => ['required', 'string'],
            'asset' => ['nullable', 'string']
        ]);

        try {
            $user = User::findOrFail($validated['user_id']);
            $account = $user->account;

            if (!$account || !$account->hdWallet) {
                return response()->json(['error' => 'No wallet found'], 404);
            }

            $hdWallet = $account->hdWallet;
            $masterAddress = env('MASTER_WALLET_ADDRESS');

            if (!$masterAddress) {
                return response()->json(['error' => 'Master wallet not configured'], 500);
            }

            $blockchainService = app(\App\Services\BlockchainService::class);
            $result = $blockchainService->transferToMaster(
                (string)$hdWallet->id,
                $masterAddress,
                $validated['chain'],
                $validated['asset']
            );

            Log::warning('Admin initiated sweep to master', [
                'admin_id' => Auth::id(),
                'user_id' => $validated['user_id'],
                'chain' => $validated['chain'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Transfer initiated successfully',
                'result' => $result
            ]);
        } catch (\Exception $e) {
            Log::error('Transfer to master failed', [
                'error' => $e->getMessage(),
                'user_id' => $validated['user_id']
            ]);

            return response()->json(['error' => 'Transfer failed: ' . $e->getMessage()], 500);
        }
    }
}
