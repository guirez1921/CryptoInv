<?php

namespace App\Jobs;

use App\Models\Chat;
use App\Services\ChatBotService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendBotResponse implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $chat;

    /**
     * Create a new job instance.
     */
    public function __construct(Chat $chat)
    {
        $this->chat = $chat;
    }

    /**
     * Execute the job.
     */
    public function handle(ChatBotService $chatBotService): void
    {
        $chatBotService->sendBotResponse($this->chat);
    }
}
