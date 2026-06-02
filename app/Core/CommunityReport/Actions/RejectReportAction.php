<?php

namespace App\Core\CommunityReport\Actions;

use App\Core\CommunityReport\Dto\RejectReportDto;
use App\Core\CommunityReport\Enums\ReportStatus;
use App\Core\CommunityReport\Exceptions\InvalidStateTransitionException;
use App\Core\CommunityReport\Models\ReportSubmission;
use Illuminate\Support\Facades\DB;

class RejectReportAction
{
    public function execute(RejectReportDto $dto): ReportSubmission
    {
        return DB::transaction(function () use ($dto) {
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
    }
}
