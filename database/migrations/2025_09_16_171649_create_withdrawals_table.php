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
        Schema::create('withdrawals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('account_id')->constrained()->onDelete('cascade');
            $table->foreignId('asset_id')->constrained('assets');
            $table->foreignId('hd_wallet_id')->nullable()->constrained()->onDelete('set null');
            $table->string('chain')->default('ethereum');
            $table->foreignId('blockchain_transaction_id')->nullable()->constrained('blockchain_transactions');
            $table->string('withdrawal_address')->index();
            $table->decimal('amount', 36, 18);
            $table->decimal('network_fee', 36, 18);
            $table->decimal('platform_fee', 36, 18)->default(0);
            $table->decimal('final_amount', 36, 18);
            $table->enum('status', ['pending', 'processing', 'sent', 'completed', 'failed', 'cancelled'])->default('pending');
            $table->string('transaction_hash')->nullable()->index();
            $table->integer('confirmations')->default(0);
            $table->integer('required_confirmations')->default(6);
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->foreignId('approved_by_admin_id')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            $table->text('admin_notes')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['hd_wallet_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('withdrawals');
    }
};
