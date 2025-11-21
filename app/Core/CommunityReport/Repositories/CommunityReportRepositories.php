<?php

namespace App\Core\CommunityReport\Repositories;

use App\Core\CommunityReport\Dto\CreateReportDto;
use App\Core\CommunityReport\Models\CommunityReport;

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
}