<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Core\BulletinBoard\Announcement\Interfaces\AnnouncementRepositoryInterface;
use App\Core\BulletinBoard\Announcement\Repository\AnnouncementRepository;
class BulletinBoardProviders extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(
            AnnouncementRepositoryInterface::class,
            AnnouncementRepository::class
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
