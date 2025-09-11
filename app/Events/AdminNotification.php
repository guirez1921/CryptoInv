<?php

namespace App\Events;

use App\Models\Chat;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AdminNotification implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $user;
    public $chat;

    /**
     * Create a new event instance.
     */
    public function __construct(string $message, User $user, Chat $chat)
    {
        $this->message = $message;
        $this->user = $user;
        $this->chat = $chat;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $admin = $this->user->admin;
        
        return $admin ? [
            new PrivateChannel('user.' . $admin->id),
            new PrivateChannel('admin.notifications.' . $admin->id),
        ] : [];
    }

    public function broadcastAs(): string
    {
        return 'admin.notification';
    }

    public function broadcastWith(): array
    {
        return [
            'message' => $this->message,
            'type' => 'chat',
            'user' => $this->user->only(['id', 'name', 'email']),
            'chat_id' => $this->chat?->id,
            'timestamp' => now()->toISOString(),
        ];
    }
}
