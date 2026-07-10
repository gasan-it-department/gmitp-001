<?php

namespace App\Core\CommunityReport\Actions;

use App\Core\CommunityReport\Dto\RestoreReportDto;
use App\Core\CommunityReport\Models\ReportSubmission;
use Illuminate\Support\Facades\DB;

class RestoreReportAction
{
    public function execute(RestoreReportDto $dto): ReportSubmission
    {
        return DB::transaction(function () use ($dto) {
            $report = ReportSubmission::withTrashed()
                ->where('municipal_id', $dto->municipalId)
                ->whereKey($dto->reportId)
                ->lockForUpdate()
                ->firstOrFail();

            if ($report->trashed()) {
                $report->restore();
            }

            return $report;
        }, attempts: 3);
    }
}
