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
        Schema::create('wallet_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hd_wallet_id')->constrained()->onDelete('cascade');
            $table->string('address')->unique()->index();
            $table->unsignedInteger('address_index');
            $table->string('derivation_path');
            $table->string('chain');
            $table->string('type')->default('spot'); // e.g., spot, margin, futures
            $table->string('asset')->nullable(); // e.g., ETH, BTC
            $table->enum('purpose', ['deposit', 'change', 'trading', 'cold_storage'])->default('deposit');
            $table->decimal('balance', 36, 18)->default(0);
            $table->decimal('gas_balance', 36, 18)->default(0);
            $table->boolean('is_used')->default(false);
            $table->timestamp('used_at')->nullable();
            $table->timestamp('last_sync_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['hd_wallet_id', 'address_index']);
            $table->index(['hd_wallet_id', 'is_used']);
            $table->unique(['hd_wallet_id', 'address_index']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wallet_addresses');
    }
};
