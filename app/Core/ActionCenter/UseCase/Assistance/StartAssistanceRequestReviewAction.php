<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Services\AssistanceMswdVerificationService;
use App\Core\ActionCenter\Services\AssistanceRequestSmsNotifier;
use Illuminate\Support\Facades\DB;

class StartAssistanceRequestReviewAction
{
    public function __construct(
        private readonly AssistanceRequestSmsNotifier $smsNotifier,
        private readonly AssistanceMswdVerificationService $mswdVerification,
    ) {}

    public function execute(
        string $assistanceRequestId,
        string $municipalId,
        string $reviewerId,
    ): AssistanceRequest {
        [$request, $firstReview] = DB::transaction(function () use ($assistanceRequestId, $municipalId, $reviewerId) {
            // Serialize the SMS decision with start(), which owns all workflow guards.
            $before = AssistanceRequest::query()
                ->whereKey($assistanceRequestId)
                ->lockForUpdate()
                ->firstOrFail();

            $wasPending = $before->status === AssistanceStatus::Pending;
            $request = $this->mswdVerification->start($assistanceRequestId, $municipalId, $reviewerId);

            return [$request, $wasPending && $request->status === AssistanceStatus::UnderReview];
        }, attempts: 3);

        if ($firstReview) {
            DB::afterCommit(fn () => $this->smsNotifier->reviewStarted($request));
        }

        return $request;
    }
}
