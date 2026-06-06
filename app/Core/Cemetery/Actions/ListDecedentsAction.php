<?php

namespace App\Core\Cemetery\Actions;

use App\Core\Cemetery\Models\Decedent;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Paginated, tenant-scoped decedent registry for the admin index (direct
 * Eloquent — no repository). The caller passes the municipal_id pulled from
 * `app('municipal_id')`.
 */
class ListDecedentsAction
{
    public function execute(string $municipalId, int $perPage = 10): LengthAwarePaginator
    {
        return Decedent::with(['currentInterment.plot'])
            ->where('municipal_id', $municipalId)
            ->orderByDesc('date_of_registration')
            ->paginate($perPage);
    }
}
