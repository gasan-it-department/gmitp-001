<?php

namespace App\Core\Cemetery\Actions\Decedents;

use App\Core\Cemetery\Models\Decedent;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListDecedentsAction
{
    public function execute(string $municipalId, int $perPage = 10): LengthAwarePaginator
    {
        return Decedent::with(['currentInterment.plot', 'unidentifiedDetail'])
            ->where('municipal_id', $municipalId)
            ->orderByDesc('date_of_registration')
            ->paginate($perPage);
    }
}
