<?php
namespace App\Core\Procurement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\HasMany;
class ProcurementFundingSource extends Model
{
    use HasUlids;

    protected $fillable = [
        'name',
        'code',
        'type',
        'is_active',
    ];

    /**
     * A funding source can be used by many procurement projects.
     */
    public function procurements(): HasMany
    {
        return $this->hasMany(Procurement::class, 'funding_source_id');
    }
}