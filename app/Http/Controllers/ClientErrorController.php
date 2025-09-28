<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ClientErrorController extends Controller
{
    public function store(Request $request)
    {
        $payload = $request->all();

        // Log the client error with context
        Log::error('[ClientError] received', ['payload' => $payload, 'ip' => $request->ip()]);

        // Optionally persist to a DB table or external service here

        return response()->json(['success' => true]);
    }
}
