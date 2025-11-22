<?php

namespace App\Core\CommunityReport\Repositories;

use App\Core\CommunityReport\Dto\CreateReportDto;
use App\Core\CommunityReport\Models\CommunityReport;
use App\Core\CommunityReport\Models\CommunityReportFiles;

class CommunityReportRepositories
{
    public function save(string $municipalId, CreateReportDto $dto, $reportId)
    {
        return CommunityReport::create([
            'id' => $reportId,
            'type' => $dto->type,
            'sender_name' => $dto->name,
            'description' => $dto->description,
            'latitude' => $dto->latitude,
            'longitude' => $dto->longitude,
            'contact' => $dto->contact,
            'location' => $dto->location,
            'municipal_id' => $municipalId,
            'user_id' => $dto->userId,
        ]);
    }

    public function saveFile(string $reportId, array $reportFile, string $fileId)
    {

        return CommunityReportFiles::create([

            'id' => $fileId,

            'report_id' => $reportId,

            'original_name' => $reportFile['original_name'],

            'mime_type' => $reportFile['mime_type'],

            'public_id' => $reportFile['public_id'],

            'file_url' => $reportFile['file_url'],

        ]);

    }
}