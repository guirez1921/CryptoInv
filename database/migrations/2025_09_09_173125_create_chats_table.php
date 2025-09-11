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
        Schema::create('chats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('admin_id')->nullable()->constrained('admins')->onDelete('set null');
            $table->text('message');
            $table->enum('message_type', ['text', 'image', 'system'])->default('text');
            $table->enum('status', ['sent', 'delivered', 'read'])->default('sent');
            $table->boolean('is_from_admin')->default(false);
            $table->boolean('is_bot_message')->default(false);
            $table->foreignId('replied_to_id')->nullable()->constrained('chats')->onDelete('set null');
            $table->timestamps();

            $table->index(['user_id', 'admin_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chats');
    }
};
