<?php

namespace App\Core\CommunityReport\Actions;

use App\Core\CommunityReport\Dto\StartReportProgressDto;
use App\Core\CommunityReport\Enums\ReportStatus;
use App\Core\CommunityReport\Exceptions\InvalidStateTransitionException;
use App\Core\CommunityReport\Models\ReportSubmission;
use App\Core\Users\UseCases\GetUserByIdUseCase;
use App\Shared\Sms\Contracts\SmsProviderInterface;
use Illuminate\Support\Facades\DB;

class StartReportProgressAction
{
    public function __construct(
        protected SmsProviderInterface $smsProvider,
        protected GetUserByIdUseCase $getUser,
    ) {
    }

    public function execute(StartReportProgressDto $dto): ReportSubmission
    {
        $report = DB::transaction(function () use ($dto) {
            $report = ReportSubmission::query()
                ->where('municipal_id', $dto->municipalId)
                ->whereKey($dto->reportId)
                ->lockForUpdate()
                ->firstOrFail();

            $allowed = [ReportStatus::PENDING, ReportStatus::ACKNOWLEDGED];

            if (!in_array($report->status, $allowed)) {
                throw InvalidStateTransitionException::fromStatus(
                    $report->status->value,
                    ReportStatus::IN_PROGRESS->value
                );
            }

            $report->update([
                'status' => ReportStatus::IN_PROGRESS,
                'in_progress_at' => now(),
                'in_progress_by' => $dto->actorUserId,
                'assigned_to' => $dto->assignedTo,
            ]);

            return $report;
        }, attempts: 3);

        // Fetch user and send SMS outside the transaction to avoid blocking DB connections
        $user = $this->getUser->execute($report->user_id);

        if ($user && $user->phone) {
            $message = "Magandang araw! Ang inyong ulat sa Community Report ay kasalukuyan nang inaaksyunan. Maraming salamat!";

            $this->smsProvider->send($user->phone, $message);
        }

        return $report;
    }
}
