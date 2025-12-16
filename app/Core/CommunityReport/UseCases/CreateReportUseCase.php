<?php

namespace App\Core\CommunityReport\UseCases;

use App\Core\CommunityReport\Enums\CommunityReportStatus;
use Illuminate\Support\Facades\DB;
use App\Shared\IdGenerator\Services\IdGenerator;
use App\Core\CommunityReport\Dto\CreateReportDto;
use App\Shared\FileUploader\CloudinaryFileUploadService;
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

            $status = CommunityReportStatus::PENDING;

            $this->communityReportRepo->save($municipalId, $dto, $reportId, $status);

            if (!empty($dto->reportFiles)) {

                $folder = 'report_files/' . $reportId;

                foreach ($dto->reportFiles as $file) {

                    $fileId = $this->idGenerate->generate();

                    $fileData = $this->uploader->uploadFiles($file, $folder);

                    $this->communityReportRepo->saveFile($reportId, $fileData, $fileId);

                }


            }

            return $reportId;

        });

    }
}