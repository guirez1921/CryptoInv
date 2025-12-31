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
    // 

    protected function runNode(string $fn, array $args = [])
    {
        // Build base node command
        $command = ['node', '--no-warnings', $this->runnerPath, $fn, ...$args, '--no-warning'];

        $commandString = implode(' ', $command);
        Log::info('[BlockchainService] runNode starting', [
            'function' => $fn,
            'args' => $args,
            'command' => $commandString,
        ]);

        // Just run with inherited environment
        $process = new Process($command, base_path());

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

        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::error('[BlockchainService] runNode returned invalid JSON', [
                'function' => $fn,
                'output' => $output,
                'json_error' => json_last_error_msg()
            ]);
            return null;
        }

        return $decoded;
    }

    // --- Wrapper methods ---

    public function createHDWallet(string $accountId, string $chain = 'ethereum', string $type = 'spot')
    {
        Log::info('[BlockchainService] createHDWallet', ['accountId' => $accountId, 'chain' => $chain, 'type' => $type]);
        $res = $this->runNode('createHDWallet', [$accountId, $chain, $type]);
        Log::debug('[BlockchainService] createHDWallet result', ['result' => $res]);
        return $res;
    }

    public function createAddress(string $hdWalletId, string $chain, ?int $index = null, ?string $asset = null)
    {
        // Logic to construct args safely for runner: [id, chain, index, asset]
        // If index is null but asset is set, we must pass null for index so asset is 4th argument.
        
        $args = [$hdWalletId, $chain, $index, $asset];

        Log::info('[BlockchainService] createAddress', ['hdWalletId' => $hdWalletId, 'chain' => $chain, 'index' => $index, 'asset' => $asset]);
        $res = $this->runNode('createAddress', $args);
        Log::debug('[BlockchainService] createAddress result', ['result' => $res]);
        return $res;
    }

    public function checkBalance(string $walletAddress, string $chain, ?string $asset = null)
    {
        Log::info('[BlockchainService] checkBalance', ['address' => $walletAddress, 'chain' => $chain, 'asset' => $asset]);
        $res = $this->runNode('checkBalance', [$walletAddress, $chain, $asset]);
        Log::debug('[BlockchainService] checkBalance result', ['result' => $res]);
        return $res;
    }

    /**
     * Get mnemonic for HD wallet (admin only)
     */
    public function getMnemonic(int $hdWalletId): string
    {
        Log::info('[BlockchainService] getMnemonic', ['hdWalletId' => $hdWalletId]);
        $result = $this->runNode('getMnemonic', [$hdWalletId]);
        
        if (isset($result['mnemonic'])) {
            return $result['mnemonic'];
        }
        
        throw new \Exception('Failed to retrieve mnemonic');
    }


    public function transferToMaster(string $hdWalletId, string $chain, ?string $assetId = null)
    {
        // Get master wallet address based on chain
        $chainUpper = strtoupper($chain);
        $masterAddress = env("MASTER_WALLET_{$chainUpper}");
        
        if (!$masterAddress) {
            throw new \Exception("Master wallet not configured for chain: {$chain}");
        }

        // Logic to construct args safely for runner: [hdWalletId, masterAddress, chain, assetId]
        // NO AMOUNT (Sweep Mode)
        $args = [$hdWalletId, $masterAddress, $chain, $assetId];
        
        Log::info('[BlockchainService] transferToMaster', [
            'hdWalletId' => $hdWalletId,
            'masterAddress' => $masterAddress,
            'chain' => $chain,
            'assetId' => $assetId
        ]);
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

    // public function startBalanceCheck($address, $chain)
    // {
    //     $args = [$address, $chain];
    //     Log::info('[BlockchainService] startBalanceCheck', ['address' => $address, 'chain' => $chain]);
    //     $res = $this->runNode('startBalanceCheck', $args);
    //     Log::debug('[BlockchainService] startBalanceCheck result', ['result' => $res]);
    //     return $res;
    // }

    public function startBalanceCheck(\App\Models\Deposit $deposit, int $duration = 5)
    {
        Log::info('[BlockchainService] startBalanceCheck', ['address' => $deposit->getAddress(), 'chain' => $deposit->chain, 'duration' => $duration]);
        // Dispatch the job
        \App\Jobs\CheckBalanceJob::dispatch($deposit, $duration);
        return ['status' => 'dispatched', 'address' => $deposit->getAddress(), 'chain' => $deposit->chain, 'duration' => $duration];
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
