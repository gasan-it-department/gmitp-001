<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Models\AssistanceRequest;
use Illuminate\Pagination\LengthAwarePaginator;

class ListAssistanceRequestAction
{
    /**
     * Return a paginated, filterable list of assistance requests scoped to one municipality.
     *
     * Supported filters:
     *  - status             : pending | under_review | approved | released | rejected
     *  - assistance_type_id : ULID of the assistance type
     *  - search             : matches transaction_number, filer snapshot name, or on-behalf name
     *  - date_from / date_to: inclusive range on created_at (Y-m-d)
     *  - per_page           : rows per page, capped at 100 (default 15)
     *
     * @param  array{
     *     status?:             string|null,
     *     assistance_type_id?: string|null,
     *     search?:             string|null,
     *     date_from?:          string|null,
     *     date_to?:            string|null,
     *     per_page?:           int|string|null,
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
            ])
            ->where('ac_assistance_requests.municipal_id', $municipalId)
            ->orderBy('ac_assistance_requests.created_at', 'desc');

        // ── Status ────────────────────────────────────────────────────────────
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // ── Assistance type ───────────────────────────────────────────────────
        if (!empty($filters['assistance_type_id'])) {
            $query->where('assistance_type_id', $filters['assistance_type_id']);
        }

        // ── Date range (inclusive, on created_at) ─────────────────────────────
        if (!empty($filters['date_from'])) {
            $query->whereDate('ac_assistance_requests.created_at', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->whereDate('ac_assistance_requests.created_at', '<=', $filters['date_to']);
        }

        // ── Free-text search ──────────────────────────────────────────────────
        // Covers transaction number, the filer's frozen identity snapshot, and
        // the on-behalf name columns so admins can find a record by any name.
        if (!empty($filters['search'])) {
            $term = '%' . $filters['search'] . '%';

            $query->where(function ($q) use ($term) {
                $q->where('transaction_number', 'like', $term)
                    ->orWhere('snapshot_first_name', 'like', $term)
                    ->orWhere('snapshot_last_name', 'like', $term)
                    ->orWhere('on_behalf_first_name', 'like', $term)
                    ->orWhere('on_behalf_last_name', 'like', $term);
            });
        }

        $perPage = min((int) ($filters['per_page'] ?? 15), 100);

        return $query->paginate($perPage)->withQueryString();
    }
}
