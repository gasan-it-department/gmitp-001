<?php

namespace App\Providers;

use App\Shared\FileUploader\CloudinaryFileUploadService;
use App\Shared\FileUploader\CloudStorageService;
use App\Shared\FileUploader\Interface\FileUploadInterface;
use App\Shared\FileUploader\Interface\MediaUploadInterface;
use Illuminate\Support\ServiceProvider;

class UploadServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {

        //cloudinary
        $this->app->bind(
            FileUploadInterface::class,
            CloudinaryFileUploadService::class
        );

        //cloudflare r2
        $this->app->bind(
            MediaUploadInterface::class,
            CloudStorageService::class
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
