<?php

namespace App\Core\CommunityReport\UseCases;

use App\Core\CommunityReport\Services\CloudinaryFileUploadService;
use Illuminate\Support\Facades\DB;
use App\Shared\IdGenerator\Services\IdGenerator;
use App\Core\CommunityReport\Dto\CreateReportDto;
use App\Core\CommunityReport\Repositories\CommunityReportRepositories;

class CreateReportUseCase
{
    public function __construct(

        protected CommunityReportRepositories $communityReportRepo,

        protected CloudinaryFileUploadService $uploader,


        protected IdGenerator $idGenerate,

    ) {
    }

    public function execute(string $municipalId, CreateReportDto $dto)
    {

        return DB::transaction(function () use ($dto, $municipalId) {

            $reportId = $this->idGenerate->generate();

            $this->communityReportRepo->save($municipalId, $dto, $reportId);

            if (!empty($dto->reportFiles)) {

                foreach ($dto->reportFiles as $file) {

                    $fileMeta = $this->uploader->uploadFiles($file);

                    $fileId = $this->idGenerate->generate();

                    $this->communityReportRepo->saveFile($reportId, $fileMeta, $fileId);

                }


            }

            return $reportId;

        });

    }
}