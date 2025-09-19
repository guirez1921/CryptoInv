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
            $table->foreignId('asset_id')->nullable()->constrained('assets');
            $table->foreignId('account_id')->constrained('accounts');
            $table->foreignId('hd_wallet_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('wallet_address_id')->nullable()->constrained()->onDelete('set null');
            $table->string('chain')->default('ethereum');
            $table->enum('type', ['deposit', 'withdrawal', 'trading_deposit', 'trading_withdrawal']);
            $table->string('tx_hash')->nullable()->unique()->index();
            $table->unsignedBigInteger('block_number')->nullable();
            $table->string('from_address')->nullable();
            $table->string('to_address')->nullable();
            $table->decimal('amount', 36, 18);
            $table->decimal('gas_fee', 36, 18)->nullable();
            $table->text('error_message')->nullable();
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending')->index();
            $table->timestamp('confirmed_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index((['account_id', 'created_at']));
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
        Schema::dropIfExists('blockchain_transactions');
    }
};
