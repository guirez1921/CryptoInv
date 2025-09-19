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
        Schema::create('chain_configs', function (Blueprint $table) {
            $table->id();
            $table->string('chain_key')->unique(); // ethereum, bitcoin, polygon, etc.
            $table->string('name');
            $table->string('symbol');
            $table->unsignedInteger('coin_type'); // BIP44 coin type
            $table->unsignedTinyInteger('decimals')->default(18);
            $table->unsignedBigInteger('chain_id')->nullable(); // EIP-155 chain ID
            $table->decimal('min_deposit', 36, 18)->default(0.01);
            $table->decimal('withdrawal_fee', 36, 18)->default(0.005);
            $table->boolean('is_active')->default(true);
            $table->string('network_type')->default('mainnet');
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['chain_key', 'is_active']);
            $table->index(['coin_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chain_configs');
    }
};
