<?php

namespace App\Providers;

use App\Shared\FileUploader\CloudinaryFileUploadService;
use App\Shared\FileUploader\Interface\FileUploadInterface;
use Illuminate\Support\ServiceProvider;

class UploadServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {

        $this->app->bind(
            FileUploadInterface::class,
            CloudinaryFileUploadService::class
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
