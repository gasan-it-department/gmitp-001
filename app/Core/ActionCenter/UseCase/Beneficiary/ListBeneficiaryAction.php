<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\Beneficiary;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Paginated beneficiary registry for the current municipality.
 *
 * Unlike the interview search action, this action permits an empty filter set
 * because the caller is the dedicated, permission-protected registry page.
 */
class ListBeneficiaryAction
{
    private const DEFAULT_PER_PAGE = 15;

    private const MAX_PER_PAGE = 50;

    public function execute(string $municipalId, array $filters = []): LengthAwarePaginator
    {
        $query = Beneficiary::query()
            ->with([
                'household:id,barangay,street',
                'user:id,email',
                'media',
            ])
            ->where('municipal_id', $municipalId)
            ->where('is_active', true)
            ->whereNull('merged_into_beneficiary_id')
            ->withCount([
                'assistanceRequests as total_requests_count',
                'assistanceRequests as released_count' => fn (Builder $query) => $query->where('status', 'released'),
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
            ]);

        $this->applyNameSearch($query, $filters['search'] ?? null);
        $this->applyBirthDate($query, $filters['birth_date'] ?? null);
        $this->applyBarangay($query, $filters['barangay'] ?? null);
        $this->applySex($query, $filters['sex'] ?? null);
        $this->applyVerification($query, $filters['verification'] ?? null);

        return $query
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate($this->perPage($filters))
            ->withQueryString();
    }

    private function applyNameSearch(Builder $query, ?string $search): void
    {
        $search = trim((string) $search);
        if ($search === '') {
            return;
        }

        foreach (preg_split('/\s+/', $search) ?: [] as $word) {
            $like = '%'.mb_strtolower($word).'%';

            $query->where(function (Builder $query) use ($like) {
                $query->whereRaw('LOWER(first_name) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(middle_name) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(last_name) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(suffix) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(beneficiary_number) LIKE ?', [$like]);
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
        $query->whereHas('household', fn (Builder $query) => $query->whereRaw('LOWER(barangay) LIKE ?', [$like]));
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
        return max(5, min((int) ($filters['per_page'] ?? self::DEFAULT_PER_PAGE), self::MAX_PER_PAGE));
    }
}
