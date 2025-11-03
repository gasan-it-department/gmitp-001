<?php

namespace App\Providers;

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
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
