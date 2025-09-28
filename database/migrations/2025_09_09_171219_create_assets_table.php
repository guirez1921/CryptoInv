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
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            // $table->foreignId('blockchain_network_id')->constrained('blockchain_networks');
            $table->string('name');
            $table->string('abv_name');
            $table->string('icon');
            $table->string('contract_address')->nullable()->index();
            $table->enum('asset_type', ['native', 'token', 'nft'])->default('native');
            $table->integer('decimals')->default(18);
            $table->decimal('current_price_usd', 20, 8)->nullable();
            $table->decimal('market_cap', 20, 2)->nullable();
            $table->decimal('daily_volume', 20, 2)->nullable();
            $table->decimal('price_change_24h', 10, 4)->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('supports_deposits')->default(true);
            $table->boolean('supports_withdrawals')->default(true);
            $table->decimal('min_deposit_amount', 36, 18)->nullable();
            $table->decimal('min_withdrawal_amount', 36, 18)->nullable();
            $table->decimal('withdrawal_fee', 36, 18)->nullable();
            $table->integer('required_confirmations')->default(6);
            $table->timestamp('price_updated_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
