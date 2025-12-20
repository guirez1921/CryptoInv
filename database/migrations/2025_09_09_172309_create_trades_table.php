<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('trades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained();
            $table->foreignId('asset_id')->nullable()->constrained();
            $table->enum('strategy', ['aggressive', 'balanced', 'conservative']);
            $table->decimal('amount', 36, 18);
            $table->decimal('entry_price', 20, 8);
            $table->decimal('exit_price', 20, 8)->nullable();
            $table->integer('duration_minutes');
            $table->enum('status', ['active', 'closed', 'cancelled']);
            $table->decimal('profit_loss', 36, 18)->nullable();
            $table->timestamp('opened_at');
            $table->timestamp('closed_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trades');
    }
};
