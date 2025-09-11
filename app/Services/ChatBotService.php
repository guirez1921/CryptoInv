<?php

namespace App\Services;

use App\Models\Chat;
use App\Models\User;
use App\Events\MessageSent;

class ChatBotService
{
    private $botResponses = [
        'greeting' => [
            'Hello! Welcome to CryptoAI Support. How can I help you today?',
            'Hi there! I\'m here to assist you with any questions.',
            'Greetings! What can I help you with regarding your account?'
        ],
        'trading' => [
            'For trading questions, our team will get back to you shortly.',
            'Trading inquiries are being processed. An expert will respond soon.',
            'I\'ve noted your trading question. A specialist will assist you.'
        ],
        'account' => [
            'Account-related questions are important to us. An admin will help you soon.',
            'I\'ve logged your account inquiry. Someone will respond shortly.',
            'Account issues are being reviewed. You\'ll hear from us soon.'
        ],
        'technical' => [
            'Technical issues are being investigated. Our support team will help you.',
            'I\'ve recorded your technical concern. An expert will respond soon.',
            'Technical support has been notified of your issue.'
        ],
        'default' => [
            'Thank you for your message. An admin will respond to you shortly.',
            'I\'ve received your message and forwarded it to our team.',
            'Your inquiry has been noted. Someone will get back to you soon.',
            'Thanks for reaching out! Our support team will respond shortly.'
        ]
    ];

    public function generateResponse(string $userMessage, User $user): string
    {
        $message = strtolower($userMessage);
        
        // Check for greetings
        if (preg_match('/\b(hello|hi|hey|greetings)\b/', $message)) {
            return $this->getRandomResponse('greeting');
        }
        
        // Check for trading keywords
        if (preg_match('/\b(trade|trading|buy|sell|crypto|bitcoin|profit|loss)\b/', $message)) {
            return $this->getRandomResponse('trading');
        }
        
        // Check for account keywords
        if (preg_match('/\b(account|balance|deposit|withdraw|payment)\b/', $message)) {
            return $this->getRandomResponse('account');
        }
        
        // Check for technical keywords
        if (preg_match('/\b(error|bug|problem|issue|not working|broken)\b/', $message)) {
            return $this->getRandomResponse('technical');
        }
        
        return $this->getRandomResponse('default');
    }

    private function getRandomResponse(string $category): string
    {
        $responses = $this->botResponses[$category] ?? $this->botResponses['default'];
        return $responses[array_rand($responses)];
    }

    public function sendBotResponse(Chat $userMessage): Chat
    {
        $botResponse = $this->generateResponse($userMessage->message, $userMessage->user);
        
        $botMessage = Chat::create([
            'user_id' => $userMessage->user_id,
            'admin_id' => $userMessage->admin_id,
            'message' => $botResponse,
            'message_type' => 'text',
            'status' => 'delivered',
            'is_from_admin' => true,
            'is_bot_message' => true,
            'replied_to_id' => $userMessage->id
        ]);

        // Broadcast the bot response
        broadcast(new MessageSent($botMessage));

        return $botMessage;
    }
}