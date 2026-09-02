<?php

namespace App\Core\ActionCenter\Models;

use App\Core\ActionCenter\Enums\AssistanceGeneratedDocument;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class AssistanceType extends Model
{
    use HasUlids, SoftDeletes;

    protected $table = 'ac_assistance_types';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'name',
        'slug',
        'municipal_id',
        'description',
        'is_active',
        'cooldown_months',
        'cooldown_type',
        'cooldown_scope',
        'is_independent',
        'min_amount',
        'max_amount',
        'sort_order',
        'enabled_generated_documents',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'cooldown_months' => 'integer',
        'is_independent' => 'boolean',
        'min_amount' => 'decimal:2',
        'max_amount' => 'decimal:2',
        'sort_order' => 'integer',
        'enabled_generated_documents' => 'array',
    ];

    /**
     * Slug-based route-model binding scoped to the current municipality.
     *
     * Slugs are unique per (municipal_id, slug) — not globally — so we must
     * filter by municipal_id at resolve time. Otherwise, two LGUs running a
     * program both called "medical" would collide.
     */
    public function resolveRouteBinding($value, $field = null)
    {
        $field = $field ?: $this->getRouteKeyName();

        $query = static::query()->where($field, $value);

        if (app()->bound('municipal_id')) {
            $query->where('municipal_id', app('municipal_id'));
        }

        return $query->firstOrFail();
    }

    public function requests(): HasMany
    {
        return $this->hasMany(AssistanceRequest::class, 'assistance_type_id');
    }

    public function documents(): BelongsToMany
    {
        return $this->belongsToMany(
            DocumentType::class,
            'ac_assistance_type_documents',
            'assistance_type_id',
            'document_type_id'
        )
            ->withPivot(['is_required', 'physical_copy_requirement', 'sort_order'])
            ->withTimestamps();
    }

    /** @return array<int, string> */
    public function generatedDocumentValues(): array
    {
        if ($this->enabled_generated_documents === null) {
            return AssistanceGeneratedDocument::values();
        }

        return array_values(array_intersect(
            AssistanceGeneratedDocument::values(),
            $this->enabled_generated_documents,
        ));
    }

    public function supportsGeneratedDocument(AssistanceGeneratedDocument $document): bool
    {
        return in_array($document->value, $this->generatedDocumentValues(), true);
    }
}
