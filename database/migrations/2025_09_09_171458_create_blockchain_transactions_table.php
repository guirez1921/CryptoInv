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
        Schema::create('blockchain_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets');
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->string('tx_hash')->unique()->index();
            $table->unsignedBigInteger('block_number')->nullable();
            $table->string('from_address');
            $table->string('to_address');
            $table->decimal('amount', 36, 18);
            $table->decimal('fee', 36, 18)->nullable();
            $table->enum('status', ['pending', 'confirmed', 'failed']);
            $table->timestamp('confirmed_at')->nullable();
            $table->json('raw_data')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blockchain_transactions');
    }
};
