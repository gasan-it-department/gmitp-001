<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {

    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // if ($this->app->environment('local') && request()->server('HTTP_X_FORWARDED_PROTO') === 'https') {
        //     URL::forceScheme('https');
        // }
        // Force HTTPS for all generated links when using the tunnel
        if (str_contains(config('app.url'), 'https://')) {
            URL::forceScheme('https');
        }
    }
}
