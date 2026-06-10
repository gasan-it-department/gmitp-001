<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\Beneficiary;
use Illuminate\Database\Eloquent\Collection;

class GetUserAssistanceRequestAction
{
    /**
     * Get all assistance requests for a given user IN THE CURRENT MUNICIPALITY.
     *
     * A citizen holds one beneficiary record per LGU, so we resolve the record
     * for this municipality — the Gasan portal lists Gasan requests, not Boac.
     *
     * @param string $userId
     * @param string $municipalId
     * @return Collection
     */
    public function execute(string $userId, string $municipalId): Collection
    {
        // First, find the beneficiary record for this user in this municipality
        $beneficiary = Beneficiary::where('user_id', $userId)
            ->where('municipal_id', $municipalId)
            ->first();

        if (!$beneficiary) {
            return new Collection();
        }

        // Return all requests for this beneficiary, eager loading the assistance type and media
        return AssistanceRequest::query()
            ->with(['assistanceType:id,name,slug', 'media'])
            ->where('beneficiary_id', $beneficiary->id)
            ->latest()
            ->get();
    }
}
