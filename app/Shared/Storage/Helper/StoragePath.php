<?php

namespace App\Shared\Storage\Helper;

use App\Shared\Storage\Service\StoragePathService;

class StoragePath
{
    public static function for(int|string $municipalId): StoragePathService
    {
        return new StoragePathService($municipalId);
    }
}