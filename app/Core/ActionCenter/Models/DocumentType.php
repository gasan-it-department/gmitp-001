<?php

namespace App\Core\ActionCenter\Models;

use App\Core\Municipality\Models\Municipality;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentType extends Model
{
    use HasUlids;

    protected $table = 'ac_document_types';

    protected $guarded = [];

    public function municipality(): BelongsTo
    {
        return $this->belongsTo(Municipality::class, 'municipal_id');
    }

    public function scopeAvailableToMunicipality(Builder $query, string $municipalId): Builder
    {
        return $query->where(function (Builder $ownership) use ($municipalId): void {
            $ownership
                ->whereNull('municipal_id')
                ->orWhere('municipal_id', $municipalId);
        });
    }
}
