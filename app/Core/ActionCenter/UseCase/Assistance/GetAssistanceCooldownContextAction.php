<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Services\AssistanceCooldownService;
use Carbon\CarbonImmutable;

final class GetAssistanceCooldownContextAction
{
    public function __construct(
        private readonly AssistanceCooldownService $cooldowns,
    ) {}

    /** @return array<string, mixed> */
    public function execute(string $requestId, string $municipalId, CarbonImmutable $releaseDate): array
    {
        $request = AssistanceRequest::query()
            ->with(['assistanceType', 'beneficiary', 'onBehalfHouseholdMember'])
            ->whereKey($requestId)
            ->where('municipal_id', $municipalId)
            ->firstOrFail();

        if ($request->status !== AssistanceStatus::Approved || $request->hasReleaseArtifacts()) {
            throw new \DomainException('Cooldown context is available only for approved, unreleased requests.');
        }

        $evaluation = $this->cooldowns->evaluate(
            $request->beneficiary,
            $request->assistanceType,
            $request->onBehalfHouseholdMember,
            $releaseDate,
            $request->id,
        );
        $authorization = data_get($request->metadata, 'cooldown_exception_authorization');
        $payload = $evaluation->advisory->toArray();
        $payload['permanent_block'] = $evaluation->hasPermanentBlock;
        $payload['authorization_current'] = ! $evaluation->advisory->isActive()
            || (is_array($authorization)
                && $this->cooldowns->authorizationCovers(
                    $evaluation->advisory,
                    is_array($authorization['sources'] ?? null) ? $authorization['sources'] : [],
                ));

        return $payload;
    }
}
