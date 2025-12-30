<?php

namespace App\Core\CommunityReport\UseCases;

use App\Core\CommunityReport\Dto\CommunityReportQueryDto;
use App\Core\CommunityReport\Repositories\CommunityReportRepositories;

class GetUserReportUseCase
{

    public function __construct(

        protected CommunityReportRepositories $communityReportRepo

    ) {
    }

    public function execute(CommunityReportQueryDto $dto, string $userId)
    {

        return $this->communityReportRepo->getByUserId($dto, $userId);

    }

}