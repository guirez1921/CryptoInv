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
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
            $table->foreignId('admin_id')->constrained()->onDelete('cascade');
            $table->decimal('total_balance', 36, 18)->default(0);
            $table->decimal('available_balance', 36, 18)->default(0);
            $table->decimal('invested_balance', 36, 18)->default(0);
            $table->decimal('profit', 36, 18)->default(0);
            $table->decimal('total_deposits', 36, 18)->default(0);
            $table->decimal('total_withdrawals', 36, 18)->default(0);
            $table->decimal('min_withdrawal', 36, 18)->default(0);
            $table->decimal('unrealized_pnl', 36, 18)->default(0);
            $table->decimal('realized_pnl', 36, 18)->default(0);
            $table->timestamp('last_activity_at')->nullable();
            $table->enum('account_type', ['standard', 'premium', 'vip'])->default('standard');
            $table->boolean('is_active')->default(true);
            $table->decimal('crypto_balance', 36, 18)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
