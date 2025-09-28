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
        Schema::create('hd_wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['spot', 'trading', 'savings'])->default('spot');
            $table->text('encrypted_seed'); // Encrypted mnemonic seed
            // $table->string('chain')->default('ethereum');
            $table->unsignedInteger('address_index')->default(0); // Highest derived index
            $table->boolean('is_active')->default(true);
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('last_sync_at')->nullable();
            $table->timestamp('locked_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['account_id', 'encrypted_seed']);
            $table->unique(['account_id', 'encrypted_seed']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hd_wallets');
    }
};
