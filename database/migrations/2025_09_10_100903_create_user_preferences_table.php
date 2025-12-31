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
        Schema::create('user_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('kyc_status', ['not_verified', 'pending', 'verified', 'rejected'])->default('not_verified');
            $table->boolean('two_factor_enabled')->default(false);

            // Notification preferences
            $table->boolean('notification_daily_reports')->default(true);
            $table->boolean('notification_weekly_summaries')->default(true);
            $table->boolean('notification_monthly_statements')->default(true);
            $table->boolean('notification_trade_execution')->default(false);
            $table->boolean('notification_login_new_device')->default(true);
            $table->boolean('notification_failed_login')->default(true);
            $table->boolean('notification_password_changes')->default(true);
            $table->boolean('notification_withdrawal_requests')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_preferences');
    }
};
