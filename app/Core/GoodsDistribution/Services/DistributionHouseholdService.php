<?php

namespace App\Core\GoodsDistribution\Services;

use App\Core\GoodsDistribution\Models\DistributionRequest;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Arr;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class DistributionHouseholdService
{
    public function __construct(private readonly DistributionRequestService $requests) {}

    public function fingerprint(array $snapshot): string
    {
        return $this->requests->hash(Arr::except($snapshot, ['captured_at']));
    }

    public function preview(DistributionRequest $request): array
    {
        try {
            $live = $this->requests->snapshot($request->municipal_id, $request->beneficiary_id, $request->assisted_household_member_id);

            return ['snapshot' => $live, 'fingerprint' => $this->fingerprint($live),
                'changed' => $this->fingerprint($live) !== $this->fingerprint($request->reviewed_snapshot),
                'identity_changed' => $live['identity_fingerprint'] !== $request->reviewed_snapshot['identity_fingerprint'], 'error' => null];
        } catch (\DomainException $exception) {
            return ['snapshot' => null, 'fingerprint' => null, 'changed' => false, 'identity_changed' => false, 'error' => $exception->getMessage()];
        } catch (ModelNotFoundException|NotFoundHttpException) {
            return ['snapshot' => null, 'fingerprint' => null, 'changed' => false, 'identity_changed' => false,
                'error' => 'The recipient or household is no longer active. Correct the registry and request before syncing.'];
        }
    }
}
