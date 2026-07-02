<?php

namespace App\Core\Cemetery\Actions\Interments;

use App\Core\Cemetery\Models\Interment;
use Illuminate\Validation\ValidationException;

class GetMovableIntermentAction
{
    public function execute(string $municipalId, string $intermentId): Interment
    {
        $interment = Interment::query()
            ->with([
                'decedent.unidentifiedDetail',
                'plot.parent',
                'plot.block.section',
                'plot.cemeterySite',
            ])
            ->where('municipal_id', $municipalId)
            ->findOrFail($intermentId);

        if ($interment->ended_at !== null || $interment->voided_at !== null) {
            throw ValidationException::withMessages([
                'interment' => 'Only active interments can be moved.',
            ]);
        }

        return $interment;
    }
}
