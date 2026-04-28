<?php

namespace App\Providers;

use App\Core\Procurement\Models\Procurement;
use App\Core\Tourism\Models\TourismAsset;
use App\Core\Users\Models\User;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\ServiceProvider;

class MorphMapServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        Relation::enforceMorphMap([
            'tourism_asset' => TourismAsset::class,
            'procurement' => Procurement::class,
            'user' => User::class
        ]);
    }
}
