<?php

namespace App\Core\Government\Repositories;

use Illuminate\Support\Facades\DB;
use App\Core\Government\Dto\TermDto;
use App\Core\Government\Models\Term;

class TermRepository
{

    public function save(string $termId, TermDto $dto, string $slug)
    {

        // if ($dto->isCurrent) {
        //     Term::where('municipal_id', $dto->municipalId)
        //         ->update(['is_current' => false]);
        // }

        $term = Term::Create([

            'id' => $termId,

            'name' => $dto->name,

            'statutory_start' => $dto->statutoryStart,

            'statutory_end' => $dto->statutoryEnd,

            'is_current' => $dto->isCurrent,

            'municipal_id' => $dto->municipalId,

            'slug' => $slug,

        ]);

        return $term;

    }

    public function markAllAsInactive(string $municipalId)
    {

        DB::table('gov_terms')
            ->where('municipal_id', $municipalId)
            ->where('is_current', true)
            ->update(['is_current' => false]);

    }

    public function update(string $termId, TermDto $dto, string $slug)
    {

        DB::table('gov_terms')
            ->where('id', $termId)
            ->update([

                'name' => $dto->name,

                'statutory_start' => $dto->statutoryStart,

                'statutory_end' => $dto->statutoryEnd,

                'is_current' => $dto->isCurrent,

                'updated_at' => now(),

                'slug' => $slug,

            ]);

    }

    public function getByMunicipality(string $municipalId)
    {

        return Term::where('municipal_id', $municipalId)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

    }

    public function exists(string $municipalId, string $name, string $start, string $end)
    {

        return Term::where('municipal_id', $municipalId)
            ->where('name', $name)
            ->where('statutory_start', $start)
            ->where('statutory_end', $end)
            ->exists();

    }

    public function findById(string $termId)
    {

        return Term::findOrFail($termId);

    }

    public function findBySlug(string $municipalId, string $termSlug)
    {
        return Term::query()
            ->with(['municipality', 'appointments.position', 'appointments.official'])
            ->where('municipal_i', $municipalId)
            ->where('slug', $termSlug)
            ->where('is_published', true)
            ->firstOrFail();
    }

    public function getPublishedByMunicipality(string $municipalId)
    {
        return Term::where('municipal_id', $municipalId)
            ->where('is_published', true)
            ->orderBy('statutory_start', 'desc')
            ->get();

    }

    public function getPublishedBySlug(?string $termSlug, string $municipalId)
    {

        $query = Term::where('municipal_id', $municipalId)
            ->where('is_published', true);

        if ($termSlug) {
            return $query->where('slug', $termSlug)->firstOrFail();
        }

        return $query->where('is_current', true)->firstOrFail();

    }

}