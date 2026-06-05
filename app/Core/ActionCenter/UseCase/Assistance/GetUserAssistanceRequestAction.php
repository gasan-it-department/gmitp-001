<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\Beneficiary;
use Illuminate\Database\Eloquent\Collection;

class GetUserAssistanceRequestAction
{
    /**
     * Get all assistance requests for a given user.
     * 
     * @param string $userId
     * @return Collection
     */
    public function execute(string $userId): Collection
    {
        // First, find the beneficiary record associated with this user
        $beneficiary = Beneficiary::where('user_id', $userId)->first();

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
