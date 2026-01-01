<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
        'auth' => [
            'user' => Auth::user(),
            'balance' => number_format(Auth::user()?->balance ?? 0, 2, '.', ''),
            'account' => Auth::user()?->account ? [
                'total_balance' => number_format(Auth::user()->account->total_balance ?? 0, 2, '.', ''),
                'available_balance' => number_format(Auth::user()->account->available_balance ?? 0, 2, '.', ''),
                'invested_balance' => number_format(Auth::user()->account->invested_balance ?? 0, 2, '.', ''),
                'demo_balance' => number_format(Auth::user()->account->demo_balance ?? 0, 2, '.', ''),
                'profit' => number_format(Auth::user()->account->profit ?? 0, 2, '.', ''),
                'total_deposits' => number_format(Auth::user()->account->total_deposits ?? 0, 2, '.', ''),
                'unrealized_pnl' => number_format(Auth::user()->account->unrealized_pnl ?? 0, 2, '.', ''),
                'realized_pnl' => number_format(Auth::user()->account->realized_pnl ?? 0, 2, '.', ''),
            ] : null,
            'notificationCount' => Auth::user()?->notifications()->where('is_read', false)->count(),
        ],
    ]);

    }
}
