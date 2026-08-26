<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\CancelApprovedAssistanceRequestDto;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\BeneficiaryCooldown;
use App\Core\ActionCenter\Services\AssistanceRequestSmsNotifier;
use App\Core\ActionCenter\UseCase\Shared\LockAssistanceRequestAction;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;

/**
 * Cancel an approved request before physical release because its encoded
 * identity or filing context is wrong. Approval history and amount remain on
 * the request; only the status and cancellation audit fields are appended.
 */
class CancelApprovedAssistanceRequestAction
{
    public function __construct(
        private readonly LockAssistanceRequestAction $lockRequest,
        private readonly AssistanceRequestSmsNotifier $smsNotifier,
    ) {}

    public function execute(CancelApprovedAssistanceRequestDto $dto): AssistanceRequest
    {
        $request = DB::transaction(function () use ($dto): AssistanceRequest {
            // Approval, release, and cancellation all lock this row first.
            // Whichever action commits first determines what the next action sees.
            $request = $this->lockRequest->execute(
                id: $dto->assistanceRequestId,
                municipalId: $dto->municipalId,
            );

            $this->ensureApprovedAndUnreleased($request);

            $cancelledAt = now();
            $this->expireApprovalCooldowns($request, $cancelledAt);

            $request->update([
                'status' => AssistanceStatus::Cancelled,
                'cancelled_by_user_id' => $dto->cancelledByUserId,
                'cancelled_at' => $cancelledAt,
                'remarks' => $this->appendCancellationReason(
                    existing: $request->remarks,
                    reason: $dto->reason,
                    adminName: $dto->cancelledByUserName,
                    cancelledAt: $cancelledAt,
                ),
            ]);

            return $request->fresh(['cancelledBy']);
        }, attempts: 3);

        $this->smsNotifier->approvedRequestCancelled($request);

        return $request;
    }

    private function ensureApprovedAndUnreleased(AssistanceRequest $request): void
    {
        if ($request->status === AssistanceStatus::Approved
            && $request->released_at === null
            && $request->released_by_user_id === null
            && $request->release_reference_number === null) {
            return;
        }

        throw new \DomainException(match ($request->status) {
            AssistanceStatus::Released => 'Released assistance is immutable and cannot be cancelled through this workflow.',
            AssistanceStatus::Cancelled => 'This assistance request has already been cancelled.',
            AssistanceStatus::Rejected => 'A rejected request cannot be cancelled as an approved correction.',
            AssistanceStatus::Pending, AssistanceStatus::UnderReview => 'Only an approved request can use the pre-release cancellation workflow.',
            AssistanceStatus::Approved => 'Release information already exists. Resolve the financial record before attempting cancellation.',
        });
    }

    private function expireApprovalCooldowns(
        AssistanceRequest $request,
        CarbonInterface $cancelledAt,
    ): void {
        $cooldowns = BeneficiaryCooldown::query()
            ->where('assistance_request_id', $request->id)
            ->orderBy('id')
            ->lockForUpdate()
            ->get();

        foreach ($cooldowns as $cooldown) {
            $cooldown->update([
                'cooldown_expires_at' => $cancelledAt,
            ]);
        }
    }

    private function appendCancellationReason(
        ?string $existing,
        string $reason,
        string $adminName,
        CarbonInterface $cancelledAt,
    ): string {
        $stamp = sprintf(
            '[APPROVED REQUEST CANCELLED %s by %s - PRE-RELEASE CORRECTION]',
            $cancelledAt->toDateTimeString(),
            $adminName,
        );
        $block = $stamp."\n".$reason;

        return filled($existing)
            ? rtrim((string) $existing)."\n\n".$block
            : $block;
    }
}
