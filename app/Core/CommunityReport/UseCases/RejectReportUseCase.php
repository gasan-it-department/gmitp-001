<?php

namespace App\Core\CommunityReport\UseCases;

use App\Core\CommunityReport\Dto\RejectReportDto;
use App\Core\CommunityReport\Enums\CommunityReportStatus;
use App\Core\CommunityReport\Repositories\CommunityReportRepositories;
use Exception;

class RejectReportUseCase
{

    public function __construct(

        protected CommunityReportRepositories $communityReportRepo

    ) {
    }

    public function execute(RejectReportDto $dto)
    {

        $report = $this->communityReportRepo->findByIdAndMunicipality(
            reportId: $dto->reportId,
            municipalId: $dto->municipalId
        );

        if ($report->status === CommunityReportStatus::RESOLVED) {

            throw new Exception("Cannot reject a report that has already been resolved. Please reopen it first if needed.");

        }

        if ($report->status === CommunityReportStatus::REJECTED) {

            throw new Exception("This report has already been rejected.");

        }

        $report->update([
            'status' => CommunityReportStatus::REJECTED,
            'remarks' => $dto->remarks,
            'rejected_at' => now(),
            'resolved_at' => null,
        ]);

        // (Optional) NOTIFY: Send email/SMS to the citizen explaining why
        // event(new ReportRejected($report));

        return $report;

    }

}