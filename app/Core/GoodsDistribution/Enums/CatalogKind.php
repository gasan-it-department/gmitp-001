<?php

namespace App\Core\GoodsDistribution\Enums;

use App\Core\GoodsDistribution\Models\Item;
use App\Core\GoodsDistribution\Models\Program;
use App\Core\GoodsDistribution\Models\StockSource;
use App\Core\GoodsDistribution\Models\StorageLocation;

enum CatalogKind: string
{
    case Items = 'items';
    case Programs = 'programs';
    case Sources = 'sources';
    case Locations = 'locations';

    public function codePrefix(): string
    {
        return match ($this) {
            self::Items => 'ITM',
            self::Programs => 'PRG',
            self::Sources => 'SRC',
            self::Locations => 'LOC',
        };
    }

    public function model(): string
    {
        return match ($this) {
            self::Items => Item::class,
            self::Programs => Program::class,
            self::Sources => StockSource::class,
            self::Locations => StorageLocation::class,
        };
    }

    public function fields(): array
    {
        return array_merge(['code', 'name', 'is_active'], match ($this) {
            self::Items => ['category', 'description', 'base_unit'],
            self::Programs => ['description'],
            self::Sources => ['source_type', 'contact_name', 'contact_phone', 'contact_email', 'notes'],
            self::Locations => ['address', 'notes'],
        });
    }
}
