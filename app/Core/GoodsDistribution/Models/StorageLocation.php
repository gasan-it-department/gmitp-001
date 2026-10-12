<?php

namespace App\Core\GoodsDistribution\Models;

final class StorageLocation extends GoodsModel
{
    protected $table = 'gd_storage_locations';

    protected $casts = ['is_active' => 'boolean'];
}
