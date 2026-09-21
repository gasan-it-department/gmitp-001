<?php

namespace App\Core\ActionCenter\Services;

use App\Core\ActionCenter\Enums\AssistanceDisbursementStatus;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Models\AssistanceDisbursement;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\Municipality\Models\Municipality;

class AssistanceDisbursementService
{
    public function __construct(
        private readonly AssistanceMswdVerificationService $verification,
    ) {}

    public function assertRequestCanPrepare(AssistanceRequest $request): void
    {
        if ($request->status !== AssistanceStatus::Approved || $request->hasReleaseArtifacts()) {
            throw new \DomainException('Only an approved, unreleased request can enter financial preparation.');
        }

        if ($request->amount_approved === null) {
            throw new \DomainException('Record the approved amount before preparing the disbursement.');
        }

        if ($request->snapshot === null) {
            throw new \DomainException('The request is missing its frozen claimant snapshot.');
        }

        $this->verification->assertCurrent($request);
    }

    public function assertCurrent(AssistanceRequest $request, AssistanceDisbursement $disbursement): void
    {
        $this->assertRequestCanPrepare($request);

        if (! hash_equals($disbursement->source_fingerprint, $this->fingerprint($request))) {
            throw new \DomainException(
                'The approved request or MSWD verification changed after this disbursement was prepared. Void it and create a replacement.',
            );
        }

        if (number_format((float) $disbursement->amount, 2, '.', '')
            !== number_format((float) $request->amount_approved, 2, '.', '')) {
            throw new \DomainException('The prepared amount no longer matches the approved amount.');
        }
    }

    public function fingerprint(AssistanceRequest $request): string
    {
        $request->loadMissing('snapshot');

        return hash('sha256', json_encode([
            'request_id' => $request->id,
            'amount_approved' => number_format((float) $request->amount_approved, 2, '.', ''),
            'approved_at' => $request->approved_at?->toIso8601String(),
            'approved_by_user_id' => $request->approved_by_user_id,
            'claimant_snapshot' => $request->snapshot?->getAttributes(),
            'mswd_verification_fingerprint' => $request->mswd_verification_fingerprint,
            'mswd_verified_at' => $request->mswd_verified_at?->toIso8601String(),
        ], JSON_THROW_ON_ERROR));
    }

    public function payeeName(AssistanceRequest $request): string
    {
        $request->loadMissing('snapshot');
        $snapshot = $request->snapshot;
        $name = trim(implode(' ', array_filter([
            $snapshot?->first_name,
            $snapshot?->middle_name,
            $snapshot?->last_name,
            $snapshot?->suffix,
        ])));

        if ($name === '') {
            throw new \DomainException('The frozen claimant name is incomplete.');
        }

        return $name;
    }

    /** @return array<string, array{key:string,label:string,instructions:?string,office_hours:?string}> */
    public function claimLocations(string $municipalId): array
    {
        $municipalCode = Municipality::query()->whereKey($municipalId)->value('municipal_code');
        $defaults = config('action_center_disbursements.defaults.claim_locations', []);
        $municipal = filled($municipalCode)
            ? config("action_center_disbursements.municipalities.{$municipalCode}.claim_locations", [])
            : [];
        $locations = array_replace(is_array($defaults) ? $defaults : [], is_array($municipal) ? $municipal : []);

        return collect($locations)
            ->mapWithKeys(function (mixed $location, mixed $key): array {
                if (! is_array($location) || ! filled($location['label'] ?? null)) {
                    return [];
                }

                $normalizedKey = trim((string) $key);

                return [$normalizedKey => [
                    'key' => $normalizedKey,
                    'label' => trim((string) $location['label']),
                    'instructions' => filled($location['instructions'] ?? null)
                        ? trim((string) $location['instructions'])
                        : null,
                    'office_hours' => filled($location['office_hours'] ?? null)
                        ? trim((string) $location['office_hours'])
                        : null,
                ]];
            })
            ->all();
    }

    /** @return array{key:string,label:string,instructions:?string,office_hours:?string} */
    public function resolveClaimLocation(string $municipalId, string $key): array
    {
        $location = $this->claimLocations($municipalId)[trim($key)] ?? null;
        if ($location === null) {
            throw new \DomainException('Choose a configured claim location for this municipality.');
        }

        return $location;
    }

    public function assertNoActiveDisbursement(string $requestId): void
    {
        if (AssistanceDisbursement::query()
            ->where('assistance_request_id', $requestId)
            ->whereIn('status', [
                AssistanceDisbursementStatus::Preparing->value,
                AssistanceDisbursementStatus::Ready->value,
            ])
            ->exists()) {
            throw new \DomainException('Void the active disbursement before changing this approved request.');
        }
    }
}
