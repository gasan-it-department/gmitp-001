<?php

namespace App\Core\CommunityReport\Repositories;

use App\Core\CommunityReport\Dto\CreateReportDto;
use App\Core\CommunityReport\Models\CommunityReport;
use App\Core\CommunityReport\Dto\CommunityReportQueryDto;
use App\Core\CommunityReport\Models\CommunityReportFiles;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

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

            'resource_type' => $reportFile['resource_type'],

            'public_id' => $reportFile['public_id'],

            'file_size' => $reportFile['file_size'],

        ]);

    }

    public function fetchByMunicipalId(string $municipalId, CommunityReportQueryDto $dto): LengthAwarePaginator
    {

        return CommunityReport::with('attachments')
            ->where('municipal_id', $municipalId)
            ->orderBy($dto->orderBy, $dto->direction)
            ->paginate($dto->perPage);

    }

    public function findByIdAndMunicipality(string $reportId, string $municipalId): CommunityReport
    {

        return CommunityReport::with('attachments')
            ->where('municipal_id', $municipalId)
            ->findOrFail($reportId);

    }

}