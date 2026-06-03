<?php

namespace App\Shared\Traits;

use Illuminate\Database\Eloquent\Builder;

trait BelongsToMunicipality
{
    /**
     * Boot the trait to apply a global scope for multi-tenancy.
     */
    protected static function bootBelongsToMunicipality(): void
    {
        static::creating(function ($model) {
            if (empty($model->municipal_id) && app()->bound('municipal_id')) {
                $model->municipal_id = app('municipal_id');
            }
        });

        static::addGlobalScope('municipality', function (Builder $builder) {
            if (app()->bound('municipal_id')) {
                $builder->where($builder->getQuery()->from . '.municipal_id', app('municipal_id'));
            }
        });
    }

    /**
     * Explicit scope for bypassing the global scope if needed (e.g. SuperAdmin).
     */
    public function scopeAnyMunicipality(Builder $query): Builder
    {
        return $query->withoutGlobalScope('municipality');
    }
}
