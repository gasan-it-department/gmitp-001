<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Models\AssistanceRequest;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

class ListAssistanceRequestAction
{
    /**
     * Return a paginated, filterable list of assistance requests scoped to one municipality.
     *
     * Supported filters:
     *  - status               : pending | under_review | approved | released | rejected
     *  - assistance_type_id   : ULID of the assistance type
     *  - search               : matches transaction_number, filer snapshot name, or on-behalf name
     *  - date_from / date_to  : inclusive range on created_at (Y-m-d)
     *  - per_page             : rows per page, capped at 100 (default 15)
     *  - reviewed_by_user_id  : ULID of the reviewer — narrows the list to cases
     *                           assigned to one admin. Used by the "My Cases" page
     *                           to render the personal worklist.
     *
     * @param  array{
     *     status?:              string|null,
     *     assistance_type_id?:  string|null,
     *     search?:              string|null,
     *     date_from?:           string|null,
     *     date_to?:             string|null,
     *     per_page?:            int|string|null,
     *     reviewed_by_user_id?: string|null,
     * } $filters
     */
    public function execute(string $municipalId, array $filters = []): LengthAwarePaginator
    {
        // Only the relations AssistanceRequestListResource actually consumes:
        //   - assistanceType  → program name + slug for the row's "Program" column
        //   - media           → documents_count + documents_uploaded for the row
        //
        // Identity / address are read from the SNAPSHOT columns on the request
        // itself, so no beneficiary / household eager load is needed for the
        // list view (and it keeps historical rows accurate even if the
        // beneficiary later edits their profile).
        $query = AssistanceRequest::query()
            ->with([
                'assistanceType:id,name,slug',
                'media',
                'snapshot',
            ])
            ->where('ac_assistance_requests.municipal_id', $municipalId)
            ->orderBy('ac_assistance_requests.created_at', 'desc');

        // ── Status ────────────────────────────────────────────────────────────
        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // ── Assistance type ───────────────────────────────────────────────────
        if (! empty($filters['assistance_type_id'])) {
            $query->where('assistance_type_id', $filters['assistance_type_id']);
        }

        // ── Reviewer (personal worklist scope) ────────────────────────────────
        // Used by the "My Cases" page to narrow the list to cases the current
        // admin owns. Composes with the status filter so the My Cases controller
        // can pass status=under_review + reviewed_by_user_id=auth->id() and get
        // exactly the personal worklist.
        if (! empty($filters['reviewed_by_user_id'])) {
            $query->where('reviewed_by_user_id', $filters['reviewed_by_user_id']);
        }

        // ── Date range (inclusive, on created_at) ─────────────────────────────
        if (! empty($filters['date_from'])) {
            $query->whereDate('ac_assistance_requests.created_at', '>=', $filters['date_from']);
        }
        if (! empty($filters['date_to'])) {
            $query->whereDate('ac_assistance_requests.created_at', '<=', $filters['date_to']);
        }

        // ── Free-text search ──────────────────────────────────────────────────
        // Covers transaction number, the filer's frozen identity snapshot, and
        // the on-behalf name columns so admins can find a record by any name.
        $search = $this->normalizeSearch($filters['search'] ?? null);

        if ($search !== null) {
            $tokens = array_values(preg_split('/\s+/u', $search, -1, PREG_SPLIT_NO_EMPTY) ?: []);

            $query->where(function (Builder $requestQuery) use ($search, $tokens): void {
                $requestQuery->where('transaction_number', 'like', "%{$search}%")
                    ->orWhereHas('snapshot', function (Builder $snapshotQuery) use ($tokens): void {
                        $this->whereEveryNameTokenMatchesAField(
                            $snapshotQuery,
                            $tokens,
                            ['first_name', 'middle_name', 'last_name', 'suffix'],
                        );
                    })
                    ->orWhere(function (Builder $metadataQuery) use ($tokens): void {
                        $this->whereEveryNameTokenMatchesAField(
                            $metadataQuery,
                            $tokens,
                            [
                                'metadata->on_behalf_first_name',
                                'metadata->on_behalf_middle_name',
                                'metadata->on_behalf_last_name',
                                'metadata->on_behalf_suffix',
                            ],
                        );
                    });
            });
        }

        $perPage = min((int) ($filters['per_page'] ?? 15), 100);

        return $query->paginate($perPage)->withQueryString();
    }

    private function normalizeSearch(mixed $value): ?string
    {
        $search = preg_replace('/\s+/u', ' ', trim((string) $value));

        if (! is_string($search) || $search === '') {
            return null;
        }

        return mb_strtoupper($search);
    }

    /**
     * Require every search word to occur in one of the fields belonging to
     * this identity. This prevents a filer word and an assisted-person word
     * from combining into a false match.
     *
     * @param  array<int, string>  $tokens
     * @param  array<int, string>  $fields
     */
    private function whereEveryNameTokenMatchesAField(
        Builder $query,
        array $tokens,
        array $fields,
    ): void {
        foreach ($tokens as $token) {
            $term = "%{$token}%";

            $query->where(function (Builder $tokenQuery) use ($term, $fields): void {
                foreach ($fields as $index => $field) {
                    if ($index === 0) {
                        $tokenQuery->where($field, 'like', $term);
                    } else {
                        $tokenQuery->orWhere($field, 'like', $term);
                    }
                }
            });
        }
    }
}
