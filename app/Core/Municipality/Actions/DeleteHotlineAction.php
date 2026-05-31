<?php

namespace App\Core\Municipality\Actions;

use App\Core\Municipality\Models\MunicipalityHotline;
use Illuminate\Support\Facades\DB;

class DeleteHotlineAction
{
    public function execute(string $municipalId, string $id): void
    {
        DB::transaction(function () use ($municipalId, $id) {
            $hotline = MunicipalityHotline::query()
                ->where('municipal_id', $municipalId)
                ->whereKey($id)
                ->firstOrFail();

            $hotline->delete();
        }, attempts: 3);
    }
}
