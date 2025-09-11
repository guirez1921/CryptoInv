<?php

namespace App\Http\Controllers;

use App\Events\AdminNotification;
use App\Events\MessageSent;
use App\Models\Chat;
use App\Services\ChatBotService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ChatController extends Controller
{
    protected $chatBotService;

    public function __construct(ChatBotService $chatBotService)
    {
        $this->chatBotService = $chatBotService;
    }

    public function index()
    {
        $user = Auth::user();

        if ($user->isAdmin()) {
            // Admin view - show all conversations from managed users
            $conversations = $this->getAdminConversations($user);
            return Inertia::render('Chat/AdminChat', [
                'conversations' => $conversations,
                'currentUser' => $user
            ]);
        } else {
            // User view - show their conversation with admin
            $messages = $this->getUserMessages($user);
            return Inertia::render('Chat/UserChat', [
                'messages' => $messages,
                'admin' => $user->admin,
                'currentUser' => $user
            ]);
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'message_type' => 'sometimes|in:text,image,system',
            'user_id' => 'sometimes|exists:users,id' // For admin sending to specific user
        ]);

        $user = Auth::user();
        $admin = null;
        $recipientUserId = $request->user_id; // When admin is sending to specific user

        if ($user->isAdmin()) {
            // Admin sending message
            if (!$recipientUserId) {
                return response()->json(['error' => 'Recipient user required'], 400);
            }

            $recipient = \App\Models\User::find($recipientUserId);
            if (!$recipient || $recipient->account->admin_id !== $user->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $chat = Chat::create([
                'user_id' => $recipientUserId,
                'admin_id' => $user->id,
                'message' => $request->message,
                'message_type' => $request->message_type ?? 'text',
                'status' => 'delivered',
                'is_from_admin' => true,
                'is_bot_message' => false
            ]);
        } else {
            // User sending message
            $admin = $user->admin;
            if (!$admin) {
                return response()->json(['error' => 'No admin assigned'], 400);
            }

            $chat = Chat::create([
                'user_id' => $user->id,
                'admin_id' => $admin->id,
                'message' => $request->message,
                'message_type' => $request->message_type ?? 'text',
                'status' => 'sent',
                'is_from_admin' => false,
                'is_bot_message' => false
            ]);

            // Send notification to admin
            broadcast(new AdminNotification(
                "New message from {$user->name}: " . substr($request->message, 0, 50) . (strlen($request->message) > 50 ? '...' : ''),
                $user,
                $chat
            ));

            // Check if admin has responded recently (last 5 minutes)
            $recentAdminMessage = Chat::where('user_id', $user->id)
                ->where('admin_id', $admin->id)
                ->where('is_from_admin', true)
                ->where('is_bot_message', false)
                ->where('created_at', '>', now()->subMinutes(5))
                ->exists();

            // Send bot response only if admin hasn't responded recently
            if (!$recentAdminMessage) {
                // Delay bot response by 2-5 seconds to seem more natural
                $delay = rand(2, 5);
                dispatch(function () use ($chat) {
                    sleep(2);
                    $this->chatBotService->sendBotResponse($chat);
                })->delay(now()->addSeconds($delay));
            }
        }

        // Broadcast the message
        broadcast(new MessageSent($chat));

        return response()->json([
            'message' => 'Message sent successfully',
            'chat' => $chat->load(['user', 'admin', 'repliedTo'])
        ]);
    }

    public function markAsRead(Request $request, Chat $chat)
    {
        $user = Auth::user();

        // Only allow marking as read if user is the recipient
        if (($chat->is_from_admin && $chat->user_id === $user->id) ||
            (!$chat->is_from_admin && $chat->admin_id === $user->id)
        ) {
            $chat->update(['status' => 'read']);
        }

        return response()->json(['status' => 'Message marked as read']);
    }

    private function getUserMessages($user)
    {
        $admin = $user->admin;
        if (!$admin) return collect();

        return Chat::conversation($user->id, $admin->id)
            ->with(['user', 'admin', 'repliedTo'])
            ->orderBy('created_at', 'asc')
            ->get();
    }

    private function getAdminConversations($admin)
    {
        $managedUsers = $admin->managedUsers();

        $conversations = [];
        foreach ($managedUsers as $user) {
            $lastMessage = Chat::conversation($user->id, $admin->id)
                ->latest()
                ->first();

            $unreadCount = Chat::where('user_id', $user->id)
                ->where('admin_id', $admin->id)
                ->where('is_from_admin', false)
                ->where('status', '!=', 'read')
                ->count();

            if ($lastMessage) {
                $conversations[] = [
                    'user' => $user,
                    'last_message' => $lastMessage,
                    'unread_count' => $unreadCount,
                    'messages' => Chat::conversation($user->id, $admin->id)
                        ->with(['user', 'admin', 'repliedTo'])
                        ->orderBy('created_at', 'asc')
                        ->get()
                ];
            }
        }

        // Sort by last message time
        usort($conversations, function ($a, $b) {
            return $b['last_message']->created_at <=> $a['last_message']->created_at;
        });

        return $conversations;
    }

    public function getConversation(Request $request, $userId)
    {
        $admin = Auth::user();

        if (!$admin->isAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user = \App\Models\User::find($userId);
        if (!$user || $user->account->admin_id !== $admin->id) {
            return response()->json(['error' => 'User not found or unauthorized'], 404);
        }

        $messages = Chat::conversation($userId, $admin->id)
            ->with(['user', 'admin', 'repliedTo'])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json(['messages' => $messages]);
    }
}
