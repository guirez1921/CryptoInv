<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('crypto:fetch-market-data')->everyFiveMinutes();

Schedule::job(App\Jobs\AutoCreateTradesJob::class)->everyMinute();

Schedule::job(App\Jobs\FetchCandlestickJob::class)->everyMinute();

// Schedule::job(App\Jobs\CloseExpiredTradesJob::class)->everyMinute();

// Schedule::job(App\Jobs\SendDailySummaryEmailsJob::class)->dailyAt('08:00');

