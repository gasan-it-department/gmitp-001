<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Core\Auth\Domain\Contracts\AuthSessionRepositoryInterface;
use App\Core\Auth\Infrastructure\Repositories\SanctumAuthSessionRepository;

use App\Core\Auth\Domain\Contracts\LoginAttemptRepositoryInterface;
use App\Core\Auth\Infrastructure\Repositories\CacheLoginAttemptRepository;
class AuthServiveProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(
            AuthSessionRepositoryInterface::class,
            SanctumAuthSessionRepository::class
        );

        $this->app->bind(
            LoginAttemptRepositoryInterface::class,
            CacheLoginAttemptRepository::class
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
