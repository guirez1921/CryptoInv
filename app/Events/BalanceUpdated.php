<?php

// app/Events/BalanceUpdated.php
namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;
use Illuminate\Foundation\Events\Dispatchable;

class BalanceUpdated implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public string $address;
    public string $chain;
    public float $balance;
    public int $run;

    public function __construct($address, $chain, $balance, $run)
    {
        $this->address = $address;
        $this->chain = $chain;
        $this->balance = (float) $balance;
        $this->run = $run;
    }

    public function broadcastOn()
    {
        return new Channel('balances');
    }

    public function broadcastAs()
    {
        return 'balance-update';
    }
}