<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\HouseholdMember;
use Illuminate\Contracts\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * Tenant-scoped interview search across beneficiary identities and active,
 * unlinked household roster entries. The index query is paginated before the
 * page's models and relations are hydrated, so the search remains bounded as
 * the registry grows.
 */
class SearchBeneficiaryAction
{
    private const DEFAULT_PER_PAGE = 15;

    private const MAX_PER_PAGE = 50;

    public function execute(string $municipalId, array $filters = []): LengthAwarePaginator
    {
        if (! $this->hasCriteria($filters)) {
            return new LengthAwarePaginator(
                items: [],
                total: 0,
                perPage: $this->perPage($filters),
                currentPage: 1,
            );
        }

        $index = $this->combinedIndexQuery($municipalId, $filters)
            ->orderBy('sort_last_name')
            ->orderBy('sort_first_name')
            ->orderBy('record_type')
            ->orderBy('record_id');

        $paginator = $index
            ->paginate($this->perPage($filters))
            ->withQueryString();

        return $this->hydratePage($paginator);
    }

    private function combinedIndexQuery(string $municipalId, array $filters): QueryBuilder
    {
        $recordType = $filters['record_type'] ?? 'all';
        $beneficiaries = $this->beneficiaryIndexQuery($municipalId, $filters);
        $rosterEntries = $this->rosterIndexQuery($municipalId, $filters);

        if ($recordType === 'beneficiary') {
            return DB::query()->fromSub($beneficiaries, 'people');
        }

        if ($recordType === 'roster_only') {
            return DB::query()->fromSub($rosterEntries, 'people');
        }

        return DB::query()->fromSub($beneficiaries->unionAll($rosterEntries), 'people');
    }

    private function beneficiaryIndexQuery(string $municipalId, array $filters): QueryBuilder
    {
        $query = DB::table('ac_beneficiaries as beneficiary')
            ->join('ac_households as household', 'household.id', '=', 'beneficiary.household_id')
            ->where('household.municipal_id', $municipalId)
            ->whereNull('household.deleted_at')
            ->whereNull('beneficiary.deleted_at')
            ->select([
                DB::raw("'beneficiary' as record_type"),
                'beneficiary.id as record_id',
                'beneficiary.last_name as sort_last_name',
                'beneficiary.first_name as sort_first_name',
            ]);

        $this->applyNameSearch($query, 'beneficiary', $filters['search'] ?? null);
        $this->applyBirthDate($query, 'beneficiary', $filters['birth_date'] ?? null);
        $this->applyBarangay($query, 'household', $filters['barangay'] ?? null);
        $this->applySex($query, 'beneficiary', $filters['sex'] ?? null);

        $verification = $filters['verification'] ?? null;
        if ($verification === 'pending') {
            $query->whereNull('beneficiary.identity_verified_at')
                ->whereNull('beneficiary.intake_rejected_at');
        } elseif ($verification === 'verified') {
            $query->whereNotNull('beneficiary.identity_verified_at');
        } elseif ($verification === 'rejected') {
            $query->whereNotNull('beneficiary.intake_rejected_at');
        }

        return $query;
    }

    private function rosterIndexQuery(string $municipalId, array $filters): QueryBuilder
    {
        $query = DB::table('ac_household_members as member')
            ->join('ac_households as household', 'household.id', '=', 'member.household_id')
            ->where('household.municipal_id', $municipalId)
            ->whereNull('household.deleted_at')
            ->whereNull('member.deleted_at')
            ->whereNull('member.beneficiary_id')
            ->where('member.is_active', true)
            ->select([
                DB::raw("'roster_only' as record_type"),
                'member.id as record_id',
                'member.last_name as sort_last_name',
                'member.first_name as sort_first_name',
            ]);

        $this->applyNameSearch($query, 'member', $filters['search'] ?? null);
        $this->applyBirthDate($query, 'member', $filters['birth_date'] ?? null);
        $this->applyBarangay($query, 'household', $filters['barangay'] ?? null);
        $this->applySex($query, 'member', $filters['sex'] ?? null);

        $verification = $filters['verification'] ?? null;
        if ($verification === 'pending') {
            $query->where('member.is_verified_dependent', false);
        } elseif ($verification === 'verified') {
            $query->where('member.is_verified_dependent', true);
        } elseif ($verification === 'rejected') {
            $query->whereRaw('1 = 0');
        }

        return $query;
    }

    private function hydratePage(LengthAwarePaginator $paginator): LengthAwarePaginator
    {
        $indexRows = collect($paginator->items());
        $beneficiaryIds = $indexRows
            ->where('record_type', 'beneficiary')
            ->pluck('record_id')
            ->all();
        $memberIds = $indexRows
            ->where('record_type', 'roster_only')
            ->pluck('record_id')
            ->all();

        $beneficiaries = Beneficiary::query()
            ->with([
                'household:id,household_code,barangay,street',
                'user:id,email,phone',
                'media',
                'householdMemberships.household.activeHead.beneficiary',
            ])
            ->withCount([
                'assistanceRequests as total_requests_count',
                'assistanceRequests as released_count' => fn (EloquentBuilder $query) => $query->where('status', 'released'),
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
            ->whereIn('id', $beneficiaryIds)
            ->get()
            ->keyBy('id');

        $members = HouseholdMember::query()
            ->with(['household.activeHead.beneficiary'])
            ->whereIn('id', $memberIds)
            ->get()
            ->keyBy('id');

        $paginator->setCollection($indexRows->map(function (object $row) use ($beneficiaries, $members): ?array {
            $model = $row->record_type === 'beneficiary'
                ? $beneficiaries->get($row->record_id)
                : $members->get($row->record_id);

            if ($model === null) {
                return null;
            }

            return [
                'record_type' => $row->record_type,
                'record' => $model,
            ];
        })->filter()->values());

        return $paginator;
    }

    private function applyNameSearch(QueryBuilder $query, string $alias, ?string $search): void
    {
        $words = preg_split('/\s+/', trim((string) $search)) ?: [];

        foreach (array_filter($words) as $word) {
            $like = '%'.mb_strtolower($word).'%';
            $query->where(function (QueryBuilder $nested) use ($alias, $like) {
                $nested->whereRaw("LOWER({$alias}.first_name) LIKE ?", [$like])
                    ->orWhereRaw("LOWER(COALESCE({$alias}.middle_name, '')) LIKE ?", [$like])
                    ->orWhereRaw("LOWER({$alias}.last_name) LIKE ?", [$like])
                    ->orWhereRaw("LOWER(COALESCE({$alias}.suffix, '')) LIKE ?", [$like]);
            });
        }
    }

    private function applyBirthDate(QueryBuilder $query, string $alias, ?string $birthDate): void
    {
        if (filled($birthDate)) {
            $query->whereDate("{$alias}.birth_date", $birthDate);
        }
    }

    private function applyBarangay(QueryBuilder $query, string $alias, ?string $barangay): void
    {
        if (filled($barangay)) {
            $query->whereRaw(
                "LOWER(COALESCE({$alias}.barangay, '')) LIKE ?",
                ['%'.mb_strtolower(trim((string) $barangay)).'%'],
            );
        }
    }

    private function applySex(QueryBuilder $query, string $alias, ?string $sex): void
    {
        if (filled($sex)) {
            $query->where("{$alias}.sex", $sex);
        }
    }

    private function hasCriteria(array $filters): bool
    {
        return filled($filters['search'] ?? null)
            || filled($filters['birth_date'] ?? null)
            || filled($filters['barangay'] ?? null)
            || filled($filters['sex'] ?? null)
            || filled($filters['verification'] ?? null);
    }

    private function perPage(array $filters): int
    {
        $perPage = (int) ($filters['per_page'] ?? self::DEFAULT_PER_PAGE);

        return max(5, min($perPage, self::MAX_PER_PAGE));
    }
}
