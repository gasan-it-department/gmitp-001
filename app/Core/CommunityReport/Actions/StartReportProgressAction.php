<?php

namespace App\Core\CommunityReport\Actions;

use App\Core\CommunityReport\Dto\StartReportProgressDto;
use App\Core\CommunityReport\Enums\ReportStatus;
use App\Core\CommunityReport\Exceptions\InvalidStateTransitionException;
use App\Core\CommunityReport\Models\ReportSubmission;
use Illuminate\Support\Facades\DB;

class StartReportProgressAction
{
    public function execute(StartReportProgressDto $dto): ReportSubmission
    {
        return DB::transaction(function () use ($dto) {
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
    }
}
