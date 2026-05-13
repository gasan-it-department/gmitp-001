<?php

namespace App\Core\ActionCenter\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

/**
 * Admin-managed lookup table for religion options.
 * Kept as a table (not an enum) so MSWD can add new entries
 * without a developer deploying a migration.
 */
class Religion extends Model
{
    use HasUlids;

    protected $table = 'ac_religions';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['name', 'is_active', 'sort_order'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name');
    }
}
