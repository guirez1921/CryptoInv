<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Master Wallet Addresses
    |--------------------------------------------------------------------------
    |
    | Master wallet addresses for each blockchain. After deposit confirmation,
    | funds will be automatically swept to these addresses for security.
    |
    */

    'ethereum' => env('MASTER_WALLET_ETHEREUM', ''),
    'bitcoin' => env('MASTER_WALLET_BITCOIN', ''),
    'solana' => env('MASTER_WALLET_SOLANA', ''),
    'tron' => env('MASTER_WALLET_TRON', ''),
    'polygon' => env('MASTER_WALLET_POLYGON', ''),
    'bsc' => env('MASTER_WALLET_BSC', ''),

    /*
    |--------------------------------------------------------------------------
    | Auto Sweep Settings
    |--------------------------------------------------------------------------
    */

    'auto_sweep_enabled' => env('AUTO_SWEEP_ENABLED', true),
    'minimum_sweep_amount' => env('MINIMUM_SWEEP_AMOUNT', 0.001), // Minimum amount to trigger sweep
    'sweep_delay_seconds' => env('SWEEP_DELAY_SECONDS', 30), // Wait time before sweeping
];
