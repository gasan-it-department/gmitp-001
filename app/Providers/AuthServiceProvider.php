<?php

namespace App\Providers;

use App\Core\Users\Enums\EnumRoles;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

use App\Core\Auth\Services\LaravelRateLimiter;
use App\Core\Auth\Services\SanctumTokenService;

use App\Core\Auth\Services\LaravelPasswordHasher;
use \App\Core\Auth\Services\LaravelSessionService;

use App\Core\Auth\Interfaces\RateLimiterInterface;
use App\Core\Auth\Interfaces\TokenServiceInterface;
use \App\Core\Auth\Interfaces\CookieSessionInterface;
use App\Core\Auth\Interfaces\PasswordHasherInterface;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(
            PasswordHasherInterface::class,
            LaravelPasswordHasher::class
        );

        $this->app->bind(
            TokenServiceInterface::class,
            SanctumTokenService::class
        );

        $this->app->bind(
            RateLimiterInterface::class,
            LaravelRateLimiter::class
        );

        $this->app->bind(
            CookieSessionInterface::class,
            LaravelSessionService::class
        );

    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        Gate::before(function ($user, $ability) {
            if ($user->hasRole(EnumRoles::SUPER_ADMIN->value)) {
                return true;
            }
        });
    }
}
