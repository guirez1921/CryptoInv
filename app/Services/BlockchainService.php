<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

class BlockchainService
{
    protected string $runnerPath;

    public function __construct()
    {
        // Path to your Node runner.js file
        $this->runnerPath = base_path('blockchain/runner.js');
        Log::info('[BlockchainService] Initialized', ['runnerPath' => $this->runnerPath]);
    }

    /**
     * Run a Node function via runner.js
     */
    protected function runNode(string $fn, array $args = [])
    {
        // Build base node command: include Node's --no-warnings flag and pass a script-level --no-warning flag
        // --no-warnings (plural) is a Node runtime flag that suppresses deprecation warnings.
        // --no-warning (singular) is passed to the script as an argument in case runner.js checks it.
        $command = ['node', '--no-warnings', $this->runnerPath, $fn, ...$args, '--no-warning'];

        // Collect required environment variables from the real environment (do NOT read Laravel config())
        $keys = [
            'DB_CONNECTION',
            'DB_HOST',
            'DB_PORT',
            'DB_DATABASE',
            'DB_USERNAME',
            'DB_PASSWORD',
            'ENCRYPTION_KEY',
            'REVERB_APP_ID',
            'REVERB_APP_KEY',
            'REVERB_APP_SECRET',
            'REVERB_HOST',
            'REVERB_PORT',
            'REVERB_SCHEME'
        ];

        $env = [];
        foreach ($keys as $k) {
            $val = getenv($k);
            if ($val === false && function_exists('env')) {
                // env() reads from environment as well and is available in Laravel
                $val = env($k);
            }
            if (($val === null || $val === false || $val === '') && isset($_ENV[$k])) {
                $val = $_ENV[$k];
            }
            if ($val !== null && $val !== false && $val !== '') {
                $env[$k] = (string)$val;
            }
        }

        // We use the Node runtime flag --no-warnings instead of an environment variable.

        $commandString = implode(' ', $command);
        Log::info('[BlockchainService] runNode starting', [
            'function' => $fn,
            'args' => $args,
            'command' => $commandString,
            'env' => $env
        ]);

        // Use Process with array-style command and explicit env (avoids shell-embedded env assignments)
        // Pass the env array we built so the Node process sees the same environment values
        $process = new Process($command, base_path(), $env);

        $start = microtime(true);
        $process->run();
        $duration = round((microtime(true) - $start) * 1000, 2);

        $output = $process->getOutput();
        $errorOutput = $process->getErrorOutput();

        Log::debug('[BlockchainService] runNode finished', [
            'function' => $fn,
            'duration_ms' => $duration,
            'exit_code' => $process->getExitCode(),
            'output' => $output,
            'errorOutput' => $errorOutput,
        ]);

        if (!$process->isSuccessful()) {
            Log::error('[BlockchainService] runNode failed', [
                'function' => $fn,
                'command' => $commandString,
                'exit_code' => $process->getExitCode(),
                'output' => $output,
                'errorOutput' => $errorOutput,
            ]);
            throw new ProcessFailedException($process);
        }

        $decoded = json_decode($output, true);
        return json_last_error() === JSON_ERROR_NONE ? $decoded : $output;
    }


    // --- Wrapper methods ---

    public function createHDWallet(string $accountId, string $chain = 'ethereum', string $type = 'spot')
    {
        Log::info('[BlockchainService] createHDWallet', ['accountId' => $accountId, 'chain' => $chain, 'type' => $type]);
        $res = $this->runNode('createHDWallet', [$accountId, $chain, $type]);
        Log::debug('[BlockchainService] createHDWallet result', ['result' => $res]);
        return $res;
    }

    public function createAddress(string $hdWalletId, string $chain, ?int $index = null)
    {
        $args = [$hdWalletId, $chain];
        if ($index !== null) {
            $args[] = (string) $index;
        }
        Log::info('[BlockchainService] createAddress', ['hdWalletId' => $hdWalletId, 'chain' => $chain, 'index' => $index]);
        $res = $this->runNode('createAddress', $args);
        Log::debug('[BlockchainService] createAddress result', ['result' => $res]);
        return $res;
    }

    public function checkBalance(string $walletAddress, string $chain)
    {
        Log::info('[BlockchainService] checkBalance', ['address' => $walletAddress, 'chain' => $chain]);
        $res = $this->runNode('checkBalance', [$walletAddress, $chain]);
        Log::debug('[BlockchainService] checkBalance result', ['result' => $res]);
        return $res;
    }

    public function transferToMaster(string $fromWalletId, string $toMasterAddress, string $amount, string $chain, ?string $assetId = null)
    {
        $args = [$fromWalletId, $toMasterAddress, $amount, $chain];
        if ($assetId !== null) {
            $args[] = $assetId;
        }
        Log::info('[BlockchainService] transferToMaster', ['from' => $fromWalletId, 'to' => $toMasterAddress, 'amount' => $amount, 'chain' => $chain, 'assetId' => $assetId]);
        $res = $this->runNode('transferToMaster', $args);
        Log::debug('[BlockchainService] transferToMaster result', ['result' => $res]);
        return $res;
    }

    public function getWalletDetails(string $walletId)
    {
        Log::info('[BlockchainService] getWalletDetails', ['walletId' => $walletId]);
        $res = $this->runNode('getWalletDetails', [$walletId]);
        Log::debug('[BlockchainService] getWalletDetails result', ['result' => $res]);
        return $res;
    }

    public function getSupportedChains()
    {
        Log::info('[BlockchainService] getSupportedChains');
        $res = $this->runNode('getSupportedChains');
        Log::debug('[BlockchainService] getSupportedChains result', ['result' => $res]);
        return $res;
    }

    public function startBalanceCheck($address, $chain)
    {
        $args = [$address, $chain];
        Log::info('[BlockchainService] startBalanceCheck', ['address' => $address, 'chain' => $chain]);
        $res = $this->runNode('startBalanceCheck', $args);
        Log::debug('[BlockchainService] startBalanceCheck result', ['result' => $res]);
        return $res;
    }

    public function getAllAddressesForHDWallet(string $hdWalletId)
    {
        Log::info('[BlockchainService] getAllAddressesForHDWallet', ['hdWalletId' => $hdWalletId]);
        $res = $this->runNode('getAllAddressesForHDWallet', [$hdWalletId]);
        Log::debug('[BlockchainService] getAllAddressesForHDWallet result', ['result' => $res]);
        return $res;
    }

    public function getAddressesOnChain(string $accountId, string $chain, array $options = [])
    {
        // Encode options as JSON string for Node runner
        $args = [$accountId, $chain, json_encode($options)];
        Log::info('[BlockchainService] getAddressesOnChain', ['accountId' => $accountId, 'chain' => $chain, 'options' => $options]);
        $res = $this->runNode('getAddressesOnChain', $args);
        Log::debug('[BlockchainService] getAddressesOnChain result', ['result' => $res]);
        return $res;
    }

    public function getAddressSummaryAllChains(string $accountId)
    {
        Log::info('[BlockchainService] getAddressSummaryAllChains', ['accountId' => $accountId]);
        $res = $this->runNode('getAddressSummaryAllChains', [$accountId]);
        Log::debug('[BlockchainService] getAddressSummaryAllChains result', ['result' => $res]);
        return $res;
    }

    public function syncHDWalletBalances(string $hdWalletId)
    {
        Log::info('[BlockchainService] syncHDWalletBalances', ['hdWalletId' => $hdWalletId]);
        $res = $this->runNode('syncHDWalletBalances', [$hdWalletId]);
        Log::debug('[BlockchainService] syncHDWalletBalances result', ['result' => $res]);
        return $res;
    }
}
