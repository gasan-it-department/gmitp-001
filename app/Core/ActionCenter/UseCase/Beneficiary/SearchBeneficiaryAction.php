<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\Beneficiary;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Admin "find a beneficiary" lookup used during the MSWD interview.
 *
 * This is the PRIMARY duplicate-control point in the system. A citizen can
 * always create a second portal account and re-register under a slightly
 * different spelling — software can't reliably stop that at registration.
 * What DOES stop a duplicate PAYOUT is a human at the interview cross-checking
 * the applicant against the uploaded government ID. This action gives that
 * human a deliberately FUZZY net so a near-duplicate still surfaces:
 *
 *  - the name search is multi-word and order-independent: "cruz juan" still
 *    finds "Juan Dela Cruz", and each word is matched case-insensitively
 *    against first / middle / last / suffix.
 *  - birthdate, barangay and sex narrow the result set without requiring an
 *    exact name (names get misspelled; birthdates rarely do).
 *
 * Every row carries an assistance-history summary (total requests, released
 * count, last released date) computed in the SAME query — no N+1 — so the
 * interviewer can spot "this person already received cash recently" at a
 * glance.
 *
 * Tenancy: ac_beneficiaries has no municipal_id of its own; the tenant key
 * lives on the household. We scope through the household relation so an admin
 * can only ever see beneficiaries in their own municipality.
 */
class SearchBeneficiaryAction
{
    private const DEFAULT_PER_PAGE = 15;

    private const MAX_PER_PAGE = 50;

    /**
     * @param  array{
     *     search?:     string|null,
     *     birth_date?: string|null,
     *     barangay?:   string|null,
     *     sex?:        string|null,
     *     per_page?:   int|string|null,
     * }  $filters
     */
    public function execute(string $municipalId, array $filters = []): LengthAwarePaginator
    {
        // PII minimisation (RA 10173): never dump the entire beneficiary
        // directory on an empty search. The interviewer must supply at least
        // one criterion before any citizen data is returned.
        if (! $this->hasCriteria($filters)) {
            return new LengthAwarePaginator(
                items: [],
                total: 0,
                perPage: $this->perPage($filters),
                currentPage: 1,
            );
        }

        $query = Beneficiary::query()
            ->with([
                'household:id,barangay,street',
                'user:id,email',
                'media', // profile photo (avatar) — keeps the card thumbnail off N+1
            ])
            // Tenant scope — the municipal_id lives on the household row.
            ->whereHas('household', fn (Builder $q) => $q->where('municipal_id', $municipalId))
            // Assistance-history summary, all in one query.
            ->withCount([
                'assistanceRequests as total_requests_count',
                'assistanceRequests as released_count' => fn (Builder $q) => $q->where('status', 'released'),
            ])
            ->addSelect([
                'last_released_at' => AssistanceRequest::query()
                    ->select('released_at')
                    ->whereColumn('beneficiary_id', 'ac_beneficiaries.id')
                    ->where('status', 'released')
                    ->orderByDesc('released_at')
                    ->limit(1),
                'last_request_at' => AssistanceRequest::query()
                    ->select('created_at')
                    ->whereColumn('beneficiary_id', 'ac_beneficiaries.id')
                    ->orderByDesc('created_at')
                    ->limit(1),
            ])
            ->orderBy('last_name')
            ->orderBy('first_name');

        $this->applyNameSearch($query, $filters['search'] ?? null);
        $this->applyBirthDate($query, $filters['birth_date'] ?? null);
        $this->applyBarangay($query, $filters['barangay'] ?? null);
        $this->applySex($query, $filters['sex'] ?? null);
        $this->applyVerification($query, $filters['verification'] ?? null);

        return $query->paginate($this->perPage($filters))->withQueryString();
    }

    private function hasCriteria(array $filters): bool
    {
        return filled($filters['search'] ?? null)
            || filled($filters['birth_date'] ?? null)
            || filled($filters['barangay'] ?? null)
            || filled($filters['sex'] ?? null)
            || filled($filters['verification'] ?? null);
    }

    /**
     * Multi-word, order-independent, case-insensitive name match.
     *
     * Each whitespace-separated word must appear SOMEWHERE in the applicant's
     * name (AND across words, OR across the name columns). This is what lets a
     * deliberately-evasive or simply misspelled entry still surface: drop the
     * middle name, swap first/last order, vary the case — the row still matches
     * as long as the words are present.
     *
     * LOWER(col) LIKE keeps it case-insensitive on both Postgres (case-sensitive
     * LIKE) and SQLite, without depending on a specific collation.
     */
    private function applyNameSearch(Builder $query, ?string $search): void
    {
        $search = trim((string) $search);
        if ($search === '') {
            return;
        }

        $words = preg_split('/\s+/', $search) ?: [];

        foreach ($words as $word) {
            $like = '%'.mb_strtolower($word).'%';

            $query->where(function (Builder $q) use ($like) {
                $q->whereRaw('LOWER(first_name) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(middle_name) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(last_name) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(suffix) LIKE ?', [$like]);
            });
        }
    }

    private function applyBirthDate(Builder $query, ?string $birthDate): void
    {
        if (filled($birthDate)) {
            $query->whereDate('birth_date', $birthDate);
        }
    }

    private function applyBarangay(Builder $query, ?string $barangay): void
    {
        if (! filled($barangay)) {
            return;
        }

        $like = '%'.mb_strtolower(trim($barangay)).'%';

        $query->whereHas('household', fn (Builder $q) => $q->whereRaw('LOWER(barangay) LIKE ?', [$like]));
    }

    private function applySex(Builder $query, ?string $sex): void
    {
        if (filled($sex)) {
            $query->where('sex', $sex);
        }
    }

    private function applyVerification(Builder $query, ?string $verification): void
    {
        if ($verification === 'pending') {
            $query->pendingIdentityVerification();
        } elseif ($verification === 'verified') {
            $query->identityVerified();
        } elseif ($verification === 'rejected') {
            $query->intakeRejected();
        }
    }

    private function perPage(array $filters): int
    {
        $perPage = (int) ($filters['per_page'] ?? self::DEFAULT_PER_PAGE);

        return max(5, min($perPage, self::MAX_PER_PAGE));
    }
}
