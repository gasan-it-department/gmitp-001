<?php

namespace App\Core\CommunityReport\Actions;

use App\Core\CommunityReport\Dto\ResolveReportDto;
use App\Core\CommunityReport\Enums\ReportStatus;
use App\Core\CommunityReport\Exceptions\InvalidStateTransitionException;
use App\Core\CommunityReport\Models\ReportSubmission;
use Illuminate\Support\Facades\DB;

class ResolveReportAction
{
    public function execute(ResolveReportDto $dto): ReportSubmission
    {
        return DB::transaction(function () use ($dto) {
            $report = ReportSubmission::query()
                ->where('municipal_id', $dto->municipalId)
                ->whereKey($dto->reportId)
                ->lockForUpdate()
                ->firstOrFail();

            if ($report->status !== ReportStatus::IN_PROGRESS) {
                throw InvalidStateTransitionException::fromStatus(
                    $report->status->value,
                    ReportStatus::RESOLVED->value
                );
            }

            $report->update([
                'status' => ReportStatus::RESOLVED,
                'resolved_at' => now(),
                'resolved_by' => $dto->actorUserId,
                'resolution_note' => $dto->resolutionNote,
            ]);

            return $report;
        }, attempts: 3);
    }
}
