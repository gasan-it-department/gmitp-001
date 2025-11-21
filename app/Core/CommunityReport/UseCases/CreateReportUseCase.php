<?php

namespace App\Core\CommunityReport\UseCases;

use App\Core\CommunityReport\Dto\CreateReportDto;
use App\Core\CommunityReport\Repositories\CommunityReportRepositories;
use App\Shared\IdGenerator\Services\IdGenerator;

class CreateReportUseCase
{
    public function __construct(

        protected CommunityReportRepositories $communityReportRepo,

        protected IdGenerator $idGenerate


    ) {
    }

    public function execute(string $municipalId, CreateReportDto $dto)
    {

        $reportId = $this->idGenerate->generate();

        return $this->communityReportRepo->save($municipalId, $dto, $reportId);

    }
}