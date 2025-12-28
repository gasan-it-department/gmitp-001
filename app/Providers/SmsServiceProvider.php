<?php

namespace App\Providers;

use App\Shared\Sms\Service\SmsService;
use Illuminate\Support\ServiceProvider;
use App\Shared\Sms\Contracts\SmsProviderInterface;

class SmsServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(SmsProviderInterface::class, SmsService::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
