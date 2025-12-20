<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('candlesticks', function (Blueprint $table) {
            $table->id();
            $table->string('symbol');              // e.g. BTCUSDT
            $table->string('interval');            // e.g. 1m, 5m, 1h
            $table->timestamp('open_time');        // candle start
            $table->decimal('open', 20, 8);
            $table->decimal('high', 20, 8);
            $table->decimal('low', 20, 8);
            $table->decimal('close', 20, 8);
            $table->decimal('volume', 30, 10)->nullable();
            $table->timestamp('close_time')->nullable();
            $table->timestamps();

            $table->unique(['symbol', 'interval', 'open_time']); // prevent duplicates
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('candlesticks');
    }
};
