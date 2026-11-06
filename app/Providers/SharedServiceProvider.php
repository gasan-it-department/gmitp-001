<?php

namespace App\Providers;

use App\Shared\Aga\Contracts\AgaNotificationClientInterface;
use App\Shared\Aga\Services\AgaNotificationClient;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use App\Shared\IdGenerator\Services\IdGenerator;
use App\Shared\Phone\Services\PhoneFormatterService;
use Illuminate\Support\ServiceProvider;

class SharedServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(AgaNotificationClientInterface::class, AgaNotificationClient::class);
        $this->app->bind(IdGeneratorInterface::class, IdGenerator::class);

        $this->app->singleton(PhoneFormatterService::class, function ($app) {
            return new PhoneFormatterService();
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
