<?php

namespace App\Core\CommunityReport\UseCases;

use App\Core\CommunityReport\Enums\CommunityReportStatus;
use App\Core\CommunityReport\Repositories\CommunityReportRepositories;
use Exception;

class ResolvedReportUseCase
{

    public function __construct(
        protected CommunityReportRepositories $communityReportRepo
    ) {
    }

    public function execute(string $reportId, string $municipalId)
    {

        $report = $this->communityReportRepo->findByIdAndMunicipality($reportId, $municipalId);

        if ($report->status === CommunityReportStatus::RESOLVED || $report->resolved_at !== null) {

            throw new Exception("This report has already been marked as resolved.");

        }

        $report->update([
            'resolved_at' => now(),
            'status' => CommunityReportStatus::RESOLVED,
        ]);

        return $report;
    }

}