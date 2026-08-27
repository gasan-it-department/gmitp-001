<?php

namespace App\Providers;

use App\Core\ActionCenter\Contracts\AssistanceRequestFormDefinitionProvider;
use App\Core\ActionCenter\Contracts\FinancialDocumentDefaultsProvider;
use App\Core\ActionCenter\Services\ConfiguredAssistanceRequestFormDefinitionProvider;
use App\Core\ActionCenter\Services\ConfiguredFinancialDocumentDefaultsProvider;
use Illuminate\Support\ServiceProvider;

class ActionCenterServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(
            AssistanceRequestFormDefinitionProvider::class,
            ConfiguredAssistanceRequestFormDefinitionProvider::class,
        );

        $this->app->bind(
            FinancialDocumentDefaultsProvider::class,
            ConfiguredFinancialDocumentDefaultsProvider::class,
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
