<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Cross-municipality double-dip DETECTOR.
 *
 * Finds whether the exact same person (first + last + birth date + sex) is on
 * record in ANOTHER LGU's registry, so an admin can coordinate before releasing
 * aid. This is a deliberate, narrow exception to tenant isolation, justified as
 * RA 10173 fraud-prevention — and the disclosure is strictly capped:
 *
 *   • It returns ONLY the other municipality's name, code, and a public hotline
 *     contact. NEVER the other LGU's beneficiary record, amounts, or request
 *     history — those stay inside that tenant.
 *   • It is ADVISORY. Name + DOB + sex can (rarely) collide between two genuinely
 *     different people, and relocating between LGUs is legitimate. Callers use
 *     this to warn, never to block.
 *
 * Returned shape per match (already the disclosed cap):
 *   ['municipality_name' => string, 'municipal_code' => string, 'contact' => ?string]
 *
 * @see \App\External\Api\Resources\ActionCenter\CrossMunicipalityMatchResource
 */
class FindCrossMunicipalityMatchesAction
{
    /**
     * @param  string  $excludeMunicipalId  the CURRENT municipality — excluded so
     *                                       only OTHER LGUs are reported.
     * @return Collection<int, array{municipality_name: string, municipal_code: ?string, contact: ?string}>
     */
    public function execute(
        ?string $firstName,
        ?string $lastName,
        \DateTimeInterface|string|null $birthDate,
        ?string $sex,
        string $excludeMunicipalId,
    ): Collection {
        // Not enough identity to match safely — never warn on a partial.
        if (blank($firstName) || blank($lastName) || blank($birthDate)) {
            return collect();
        }

        $birth = $birthDate instanceof \DateTimeInterface
            ? $birthDate->format('Y-m-d')
            : (string) $birthDate;

        // Distinct OTHER municipalities holding an exact-identity beneficiary.
        // Raw join (tenant key is on ac_households); soft-deleted rows excluded.
        $municipalIds = DB::table('ac_beneficiaries as b')
            ->join('ac_households as h', 'h.id', '=', 'b.household_id')
            ->where('h.municipal_id', '!=', $excludeMunicipalId)
            ->whereNull('b.deleted_at')
            ->whereNull('h.deleted_at')
            ->whereRaw('LOWER(b.first_name) = ?', [mb_strtolower($firstName)])
            ->whereRaw('LOWER(b.last_name) = ?', [mb_strtolower($lastName)])
            ->whereDate('b.birth_date', $birth)
            ->when(filled($sex), fn ($q) => $q->where('b.sex', $sex))
            ->distinct()
            ->pluck('h.municipal_id');

        if ($municipalIds->isEmpty()) {
            return collect();
        }

        $contacts = $this->contactsFor($municipalIds->all());

        return DB::table('municipalities')
            ->whereIn('id', $municipalIds->all())
            ->orderBy('name')
            ->get(['id', 'name', 'municipal_code'])
            ->map(fn ($m) => [
                'municipality_name' => $m->name,
                'municipal_code' => $m->municipal_code,
                'contact' => $contacts[$m->id] ?? null,
            ])
            ->values();
    }

    /**
     * First active public hotline number per municipality, for coordination.
     * Returns [municipal_id => number]. A municipality with no hotline maps to
     * nothing (the contact is simply null in the result).
     *
     * @param  array<int, string>  $municipalIds
     * @return array<string, string>
     */
    private function contactsFor(array $municipalIds): array
    {
        return DB::table('municipality_hotlines')
            ->whereIn('municipal_id', $municipalIds)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get(['municipal_id', 'number'])
            ->groupBy('municipal_id')
            ->map(fn ($rows) => $rows->first()->number)
            ->all();
    }
}
