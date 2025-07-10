<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Domains\Users\Interfaces\UserRepositoryInterface;
use App\Domains\Users\Repositories\UserRepository;
class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            UserRepositoryInterface::class,
            UserRepository::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
