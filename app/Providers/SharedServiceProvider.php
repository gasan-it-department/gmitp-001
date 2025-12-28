<?php

namespace App\Providers;

use App\Shared\Phone\Services\PhoneFormatterService;
use Illuminate\Support\ServiceProvider;

use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use App\Shared\IdGenerator\Services\IdGenerator;
class SharedServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
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
