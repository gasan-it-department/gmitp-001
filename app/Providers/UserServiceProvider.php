<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Core\Users\Interfaces\PasswordHasherInterface;
use App\Core\Users\Services\PasswordHasherService;
class UserServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(
            PasswordHasherInterface::class,
            PasswordHasherService::class
        );
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
