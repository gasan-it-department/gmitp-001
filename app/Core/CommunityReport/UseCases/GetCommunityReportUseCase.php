<?php

namespace App\Core\CommunityReport\UseCases;

use App\Core\CommunityReport\Dto\CommunityReportQueryDto;
use App\Core\CommunityReport\Repositories\CommunityReportRepositories;

class GetCommunityReportUseCase
{
    public function __construct(
        protected CommunityReportRepositories $communityReportRepo,
    ) {
    }

    public function execute(CommunityReportQueryDto $dto, string $municipalId)
    {

        return $this->communityReportRepo->fetchByMunicipalId($municipalId, $dto);

    }
}
