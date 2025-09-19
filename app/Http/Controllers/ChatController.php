<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Chat;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    // 🟢 Get chat history between user and their admin
    public function getChatHistory()
    {
        $user = Auth::user();

        if ($user->isAdmin()) {
            return response()->json(['error' => 'Admins must use adminChatHistory'], 403);
        }

        $admin = $user->account->admin;

        $messages = Chat::conversation($user->id, $admin->id)
            ->with(['user', 'admin', 'repliedTo'])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'messages' => $messages,
            'admin' => $admin
        ]);
    }

    // 🟢 Send message from user to admin
    public function sendUserMsg(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'message_type' => 'in:text,image,system',
            'replied_to_id' => 'nullable|exists:chats,id',
        ]);

        $user = Auth::user();

        if ($user->isAdmin()) {
            return response()->json(['error' => 'Admins cannot use this endpoint'], 403);
        }

        $admin = $user->account->admin;

        $message = Chat::create([
            'user_id' => $user->id,
            'admin_id' => $admin->id,
            'message' => $request->message,
            'message_type' => $request->message_type ?? 'text',
            'status' => 'sent',
            'is_from_admin' => false,
            'is_bot_message' => false,
            'replied_to_id' => $request->replied_to_id,
        ]);

        broadcast(new MessageSent($message))->toOthers();

        return response()->json([
            'status' => 'success',
            'message' => $message
        ]);
    }

    // 🟢 Send message from admin to user
    public function sendAdminMsg(Request $request, User $user)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'message_type' => 'in:text,image,system',
            'replied_to_id' => 'nullable|exists:chats,id',
        ]);

        $admin = Auth::user();

        if (!$admin->isAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $message = Chat::create([
            'user_id' => $user->id,
            'admin_id' => $admin->id,
            'message' => $request->message,
            'message_type' => $request->message_type ?? 'text',
            'status' => 'sent',
            'is_from_admin' => true,
            'is_bot_message' => false,
            'replied_to_id' => $request->replied_to_id,
        ]);

        broadcast(new MessageSent($message))->toOthers();

        return response()->json([
            'status' => 'success',
            'message' => $message
        ]);
    }

    // 🟢 Mark all unread messages as read for current user
    public function markAsRead()
    {
        $user = Auth::user();

        Chat::where('user_id', $user->id)
            ->where('status', '!=', 'read')
            ->update(['status' => 'read']);

        return response()->json(['status' => 'success']);
    }

    // 🟢 Get count of unread messages for current user
    public function getUnreadCount()
    {
        $user = Auth::user();

        $count = Chat::where('user_id', $user->id)
            ->where('status', '!=', 'read')
            ->count();

        return response()->json(['unread_count' => $count]);
    }

    // 🟢 Admin: Get chat history with a specific user
    public function adminChatHistory(User $user)
    {
        $admin = Auth::user();

        if (!$admin->isAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $messages = Chat::conversation($user->id, $admin->id)
            ->with(['user', 'admin', 'repliedTo'])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'messages' => $messages,
            'user' => $user
        ]);
    }
}