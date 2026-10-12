<?php

namespace App\Core\GoodsDistribution\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;

final class Item extends GoodsModel
{
    protected $table = 'gd_items';

    protected $casts = ['is_active' => 'boolean'];

    public function receiptLines(): HasMany
    {
        return $this->hasMany(StockReceiptLine::class, 'item_id');
    }

    public function programItems(): HasMany
    {
        return $this->hasMany(ProgramItem::class);
    }
}
