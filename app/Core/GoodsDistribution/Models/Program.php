<?php

namespace App\Core\GoodsDistribution\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;

final class Program extends GoodsModel
{
    protected $table = 'gd_programs';

    protected $casts = ['is_active' => 'boolean'];

    public function programItems(): HasMany
    {
        return $this->hasMany(ProgramItem::class);
    }
}
