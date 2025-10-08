<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Core\Users\Domains\Interfaces\UserRepositoryInterface;
use App\Core\Users\Infrastructure\Repository\UserRepository;
use App\Core\Users\Application\Interfaces\PasswordHasherInterface;
use App\Core\Users\Infrastructure\Services\PasswordHasherService;
class UserServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(
            UserRepositoryInterface::class,
            UserRepository::class
        );

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
