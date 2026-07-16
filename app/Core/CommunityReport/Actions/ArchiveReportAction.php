<?php

namespace App\Core\CommunityReport\Actions;

use App\Core\CommunityReport\Dto\ArchiveReportDto;
use App\Core\CommunityReport\Enums\ReportStatus;
use App\Core\CommunityReport\Exceptions\InvalidStateTransitionException;
use App\Core\CommunityReport\Models\ReportSubmission;
use Illuminate\Support\Facades\DB;

class ArchiveReportAction
{
    public function execute(ArchiveReportDto $dto): ReportSubmission
    {
        return DB::transaction(function () use ($dto) {
            $report = ReportSubmission::query()
                ->where('municipal_id', $dto->municipalId)
                ->whereKey($dto->reportId)
                ->lockForUpdate()
                ->firstOrFail();

            if (! in_array($report->status, [ReportStatus::RESOLVED, ReportStatus::REJECTED], true)) {
                throw InvalidStateTransitionException::fromStatus(
                    $report->status->value,
                    'archived'
                );
            }

            $report->delete();

            return $report;
        }, attempts: 3);
    }
}
