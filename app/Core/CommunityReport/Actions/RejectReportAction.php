<?php

namespace App\Core\CommunityReport\Actions;

use App\Core\CommunityReport\Dto\RejectReportDto;
use App\Core\CommunityReport\Enums\ReportStatus;
use App\Core\CommunityReport\Exceptions\InvalidStateTransitionException;
use App\Core\CommunityReport\Models\ReportSubmission;
use App\Core\Users\UseCases\GetUserByIdUseCase;
use App\Shared\Sms\Contracts\SmsProviderInterface;
use Illuminate\Support\Facades\DB;

class RejectReportAction
{
    public function __construct(
        protected SmsProviderInterface $smsProvider,
        protected GetUserByIdUseCase $getUser,
    ) {
    }

    public function execute(RejectReportDto $dto): ReportSubmission
    {
        $report = DB::transaction(function () use ($dto) {
            $report = ReportSubmission::query()
                ->where('municipal_id', $dto->municipalId)
                ->whereKey($dto->reportId)
                ->lockForUpdate()
                ->firstOrFail();

            $terminal = [ReportStatus::RESOLVED, ReportStatus::REJECTED];

            if (in_array($report->status, $terminal)) {
                throw InvalidStateTransitionException::fromStatus(
                    $report->status->value,
                    ReportStatus::REJECTED->value
                );
            }

            $report->update([
                'status' => ReportStatus::REJECTED,
                'rejected_at' => now(),
                'rejected_by' => $dto->actorUserId,
                'rejection_reason' => $dto->rejectionReason,
            ]);

            return $report;
        }, attempts: 3);

        // Fetch user and send SMS outside the transaction to avoid blocking DB connections
        $user = $this->getUser->execute($report->user_id);

        if ($user && $user->phone) {
            $message = "Magandang araw! Ang inyong ulat sa Community Report ay hindi maaaksyunan sa ngayon. Maaari ninyong tingnan ang inyong account para sa karagdagang detalye. Maraming salamat!";

            $this->smsProvider->send($user->phone, $message);
        }

        return $report;
    }
}
