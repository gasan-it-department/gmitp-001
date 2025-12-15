<?php

namespace App\Core\CommunityReport\UseCases;

use App\Core\CommunityReport\Repositories\CommunityReportRepositories;

class ShowReportDetailsUseCase
{

    public function __construct(

        protected CommunityReportRepositories $communityReportRepo

    ) {
    }

    public function execute(string $municipalId, string $reportId)
    {

        return $this->communityReportRepo->findByIdAndMunicipality($reportId, $municipalId);

    }

}