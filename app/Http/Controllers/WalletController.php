<?php

namespace App\Http\Controllers;

use App\Models\HDWallet;
use App\Services\BlockchainService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class WalletController extends Controller
{
    protected BlockchainService $blockchain;

    public function __construct(BlockchainService $blockchain)
    {
        $this->blockchain = $blockchain;
    }

    /**
     * Display the wallet overview page
     */
    public function index()
    {
        $user = Auth::user();
        $account = $user->account;

        if (!$account) {
            return Inertia::render('Payments/Wallet', [
                'error' => 'No account found for this user',
                'wallet' => null,
                'addresses' => [],
                'groupedAddresses' => [],
            ]);
        }

        $hdWallet = $account->hdWallet;

        if (!$hdWallet) {
            return Inertia::render('Payments/Wallet', [
                'error' => 'HD Wallet is being created. Please check back shortly.',
                'wallet' => null,
                'addresses' => [],
                'groupedAddresses' => [],
            ]);
        }

        // Get all addresses for this wallet
        $addresses = $hdWallet->addresses()->with([])->get();

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
                        'created_at' => $address->created_at->format('M d, Y'),
                    ];
                }),
                'total_balance' => $chainAddresses->sum('balance'),
            ];
        })->values();

        return Inertia::render('Payments/Wallet', [
            'wallet' => [
                'id' => $hdWallet->id,
                'type' => $hdWallet->type,
                'status' => $hdWallet->status,
                'created_at' => $hdWallet->created_at->format('M d, Y H:i'),
                'verified_at' => $hdWallet->verified_at?->format('M d, Y H:i'),
                'is_active' => $hdWallet->is_active,
                'is_locked' => $hdWallet->isLocked(),
                'address_count' => $addresses->count(),
                'total_balance' => $hdWallet->getTotalBalance(),
            ],
            'addresses' => $addresses->map(function ($address) {
                return [
                    'id' => $address->id,
                    'address' => $address->address,
                    'chain' => $address->chain,
                    'asset' => $address->asset,
                    'balance' => $address->balance,
                    'is_used' => $address->is_used,
                    'created_at' => $address->created_at->format('M d, Y'),
                ];
            }),
            'groupedAddresses' => $groupedAddresses,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    /**
     * Get addresses for a specific chain
     */
    public function getAddressesByChain(Request $request, string $chain)
    {
        $user = Auth::user();
        $hdWallet = $user->account?->hdWallet;

        if (!$hdWallet) {
            return response()->json(['success' => false, 'message' => 'HD Wallet not found'], 404);
        }

        $addresses = $hdWallet->getAddressesByChain($chain);

        return response()->json([
            'success' => true,
            'chain' => $chain,
            'addresses' => $addresses->map(function ($address) {
                return [
                    'address' => $address->address,
                    'balance' => $address->balance,
                    'asset' => $address->asset,
                    'is_used' => $address->is_used,
                ];
            }),
        ]);
    }

    /**
     * Export mnemonic phrase (requires password confirmation)
     */
    public function exportMnemonic(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        $user = Auth::user();

        // Verify password
        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid password. Please try again.',
            ], 401);
        }

        $hdWallet = $user->account?->hdWallet;

        if (!$hdWallet) {
            return response()->json([
                'success' => false,
                'message' => 'HD Wallet not found',
            ], 404);
        }

        try {
            // Call blockchain service to get decrypted mnemonic
            $walletDetails = $this->blockchain->getWalletDetails($hdWallet->id);

            Log::info("[WalletController] Mnemonic exported for user {$user->id}");

            return response()->json([
                'success' => true,
                'mnemonic' => $walletDetails['mnemonic'] ?? null,
                'warning' => 'This is your only chance to save this mnemonic. Store it securely and never share it with anyone.',
            ]);
        } catch (\Exception $e) {
            Log::error("[WalletController] Failed to export mnemonic for user {$user->id}: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to export mnemonic. Please try again later.',
            ], 500);
        }
    }

    /**
     * Generate a new address for a specific chain
     */
    public function generateAddress(Request $request)
    {
        $request->validate([
            'chain' => 'required|string',
            'asset' => 'nullable|string',
        ]);

        $user = Auth::user();
        $hdWallet = $user->account?->hdWallet;

        if (!$hdWallet) {
            return response()->json([
                'success' => false,
                'message' => 'HD Wallet not found',
            ], 404);
        }

        try {
            $result = $this->blockchain->createAddress(
                $hdWallet->id,
                $request->chain,
                null,
                $request->asset
            );

            if (!$result || !isset($result['address'])) {
                Log::error("[WalletController] Address generation failed to return address", ['result' => $result]);
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to generate address. Result was invalid.',
                ], 500);
            }

            Log::info("[WalletController] New address generated for user {$user->id}, chain {$request->chain}");

            return response()->json([
                'success' => true,
                'address' => $result['address'],
                'chain' => $request->chain,
                'asset' => $request->asset,
            ]);
        } catch (\Exception $e) {
            Log::error("[WalletController] Failed to generate address for user {$user->id}: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate address. Please try again later.',
            ], 500);
        }
    }
}
