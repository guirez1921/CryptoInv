<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Get notifications with pagination
        $notifications = $user->notifications()
            ->latest()
            ->paginate(20);

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
        ]);
    }

    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();
        $notification = $user->notifications()->where('id', $id)->first();

        if ($notification) {
            $notification->markAsRead();
            
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Notification marked as read.'], 200);
            }
            
            return redirect()->back()->with('success', 'Notification marked as read.');
        }

        if ($request->expectsJson()) {
            return response()->json(['message' => 'Notification not found.'], 404);
        }
        
        return redirect()->back()->withErrors(['error' => 'Notification not found.']);
    }

    public function markAllAsRead(Request $request)
    {
        $user = $request->user();
        $user->unreadNotifications->markAsRead();

        if ($request->expectsJson()) {
            return response()->json(['message' => 'All notifications marked as read.'], 200);
        }
        
        return redirect()->back()->with('success', 'All notifications marked as read.');
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $notification = $user->notifications()->where('id', $id)->first();

        if ($notification) {
            $notification->delete();
            
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Notification deleted.'], 200);
            }
            
            return redirect()->back()->with('success', 'Notification deleted.');
        }

        if ($request->expectsJson()) {
            return response()->json(['message' => 'Notification not found.'], 404);
        }
        
        return redirect()->back()->withErrors(['error' => 'Notification not found.']);
    }

    public function destroyAll(Request $request)
    {
        $user = $request->user();
        $user->notifications()->delete();

        if ($request->expectsJson()) {
            return response()->json(['message' => 'All notifications deleted.'], 200);
        }
        
        return redirect()->back()->with('success', 'All notifications deleted.');
    }

    public function getUnreadCount(Request $request)
    {
        $user = $request->user();
        $count = $user->unreadNotifications()->count();

        return response()->json(['unread_count' => $count]);
    }
}