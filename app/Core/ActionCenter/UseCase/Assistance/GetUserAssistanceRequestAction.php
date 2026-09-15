<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Services\AssistanceCooldownService;
use Illuminate\Database\Eloquent\Collection;

class GetUserAssistanceRequestAction
{
    public function __construct(
        private readonly AssistanceCooldownService $cooldowns,
    ) {}

    /**
     * Get all assistance requests for a given user IN THE CURRENT MUNICIPALITY.
     *
     * A citizen holds one beneficiary record per LGU, so we resolve the record
     * for this municipality — the Gasan portal lists Gasan requests, not Boac.
     */
    public function execute(string $userId, string $municipalId): Collection
    {
        // First, find the beneficiary record for this user in this municipality
        $beneficiary = Beneficiary::where('user_id', $userId)
            ->where('municipal_id', $municipalId)
            ->first();

        if (! $beneficiary) {
            return new Collection;
        }

        // Return all requests for this beneficiary, eager loading the assistance type and media
        $requests = AssistanceRequest::query()
            ->with(['assistanceType:id,name,slug', 'beneficiary', 'media', 'onBehalfHouseholdMember', 'snapshot'])
            ->where('beneficiary_id', $beneficiary->id)
            ->latest()
            ->get();

        $requests->each(function (AssistanceRequest $request): void {
            if (! in_array($request->status, [
                AssistanceStatus::Pending,
                AssistanceStatus::UnderReview,
                AssistanceStatus::Approved,
            ], true)) {
                return;
            }

            $request->setAttribute(
                'cooldown_advisory',
                $this->cooldowns->evaluate(
                    $request->beneficiary,
                    $request->assistanceType,
                    $request->onBehalfHouseholdMember,
                    excludeRequestId: $request->id,
                )->advisory->toArray(),
            );
        });

        return $requests;
    }
}
