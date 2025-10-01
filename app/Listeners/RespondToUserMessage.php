<?php

namespace App\Listeners;

use App\Events\MessageSent;
use App\Models\Chat;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Http;
use OpenAI\Laravel\Facades\OpenAI;

class RespondToUserMessage
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(MessageSent $event): void
    {
        // $chat = $event->chat;

        // // Only respond if it's from a user, not admin or bot
        // if ($chat->is_from_admin || $chat->is_bot_message) {
        //     return;
        // }

        // // Generate response using OpenAI
        // $response = OpenAI::chat()->create([
        //     'model' => 'gpt-3.5-turbo',
        //     'messages' => [
        //         ['role' => 'user', 'content' => $chat->message],
        //     ],
        // ]);

        // $botReply = $response->choices[0]->message->content;

        // // $response = Http::withToken(config('openai.api_key'))
        // //     ->post('https://api.openai.com/v1/chat/completions', [
        // //         'model' => 'gpt-3.5-turbo',
        // //         'messages' => [
        // //             ['role' => 'user', 'content' => $chat->message],
        // //         ],
        // //     ]);

        // // $botReply = $response->json('choices.0.message.content');


        // // Save bot response to chats table
        // $chat = Chat::create([
        //     'user_id' => $chat->user_id,
        //     'message' => $botReply,
        //     'message_type' => 'text',
        //     'status' => 'sent',
        //     'is_from_admin' => false,
        //     'is_bot_message' => true,
        //     'replied_to_id' => $chat->id,
        // ]);

        // broadcast(new MessageSent($chat));
    }
}
