<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\CorrectApprovedAssistanceAmountDto;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\UseCase\Shared\LockAssistanceRequestAction;
use App\Core\Users\Models\User;
use Illuminate\Support\Facades\DB;

class CorrectApprovedAssistanceAmountAction
{
    public function __construct(
        private readonly LockAssistanceRequestAction $lockRequest,
    ) {}

    public function execute(CorrectApprovedAssistanceAmountDto $dto): AssistanceRequest
    {
        return DB::transaction(function () use ($dto): AssistanceRequest {
            $request = $this->lockRequest->execute(
                id: $dto->assistanceRequestId,
                municipalId: $dto->municipalId,
                with: ['assistanceType'],
            );

            $this->ensureApprovedAndUnreleased($request);
            $this->ensureAmountWithinProgramLimits($request, $dto->amountApproved);

            $oldAmount = (float) $request->amount_approved;
            if (number_format($oldAmount, 2, '.', '') === number_format($dto->amountApproved, 2, '.', '')) {
                throw new \DomainException('The corrected amount must be different from the current approved amount.');
            }

            // The explicit correction activity below carries the reason and
            // avoids a second generic model-updated entry for the same change.
            $request->disableLogging();
            try {
                $request->correctApprovedAmount($dto->amountApproved);
            } finally {
                $request->enableLogging();
            }

            $correctedAt = now();

            activity('assistance_request')
                ->performedOn($request)
                ->causedBy(User::find($dto->correctedByUserId))
                ->withProperties([
                    'municipal_id' => $dto->municipalId,
                    'attributes' => [
                        'amount_approved' => number_format($dto->amountApproved, 2, '.', ''),
                    ],
                    'old' => [
                        'amount_approved' => number_format($oldAmount, 2, '.', ''),
                    ],
                    'corrected_by_user_id' => $dto->correctedByUserId,
                    'correction_reason' => $dto->reason,
                    'corrected_at' => $correctedAt->toIso8601String(),
                ])
                ->log('Corrected approved assistance amount');

            return $request->fresh([
                'assistanceType',
                'approvedBy',
            ]);
        }, attempts: 3);
    }

    private function ensureApprovedAndUnreleased(AssistanceRequest $request): void
    {
        if ($request->status !== AssistanceStatus::Approved) {
            throw new \DomainException('Only an approved, unreleased assistance request can use the amount correction workflow.');
        }

        if ($request->released_at !== null
            || $request->released_by_user_id !== null
            || filled($request->release_reference_number)) {
            throw new \DomainException('This approved request contains release information and its amount can no longer be corrected.');
        }

        if ($request->amount_approved === null) {
            throw new \DomainException('This request has no approved amount to correct.');
        }
    }

    private function ensureAmountWithinProgramLimits(AssistanceRequest $request, float $amount): void
    {
        $type = $request->assistanceType;

        if ($type === null) {
            throw new \DomainException('The assistance program could not be loaded for amount validation.');
        }

        if ($type->min_amount !== null && $amount < (float) $type->min_amount) {
            throw new \DomainException(sprintf(
                'The corrected amount must be at least PHP %s for this program.',
                number_format((float) $type->min_amount, 2),
            ));
        }

        if ($type->max_amount !== null && $amount > (float) $type->max_amount) {
            throw new \DomainException(sprintf(
                'The corrected amount cannot exceed PHP %s for this program.',
                number_format((float) $type->max_amount, 2),
            ));
        }
    }
}
