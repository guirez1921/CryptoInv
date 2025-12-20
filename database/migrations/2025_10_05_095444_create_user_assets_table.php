<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('user_assets', function (Blueprint $table) {
            $table->id();

            // Relationships
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('asset_id')->constrained()->cascadeOnDelete();

            // Balances
            $table->decimal('available_balance', 36, 18)->default(0);
            $table->decimal('locked_balance', 36, 18)->default(0);   // e.g. in open trades
            $table->decimal('invested_balance', 36, 18)->default(0); // e.g. in strategies

            // Useful metadata
            $table->decimal('average_entry_price', 36, 18)->nullable();
            $table->decimal('total_deposited', 36, 18)->default(0);
            $table->decimal('total_withdrawn', 36, 18)->default(0);

            $table->timestamps();

            // Prevent duplicate rows for same user/asset
            $table->unique(['user_id', 'asset_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_assets');
    }
};
