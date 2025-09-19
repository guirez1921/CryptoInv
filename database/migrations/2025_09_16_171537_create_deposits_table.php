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
        Schema::create('deposits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('asset_id')->constrained()->onDelete('cascade');
            $table->foreignId('blockchain_transaction_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('hd_wallet_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('wallet_address_id')->nullable()->constrained()->onDelete('set null');
            $table->string('chain')->default('ethereum');
            $table->string('deposit_address')->index();
            $table->decimal('amount', 36, 18);
            $table->decimal('network_fee', 36, 18)->nullable();
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled'])->default('pending');
            $table->string('transaction_hash')->nullable()->index();
            $table->integer('confirmations')->default(0);
            $table->integer('required_confirmations')->default(6);
            $table->timestamp('confirmed_at')->nullable();
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['hd_wallet_id', 'created_at']);
            $table->index(['wallet_address_id', 'created_at']);
            $table->index(['chain', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deposits');
    }
};
