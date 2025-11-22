<?php

namespace App\Core\CommunityReport\Dto;
class CreateReportDto
{
    public function __construct(

        public readonly string $type,

        public readonly string $description,

        public readonly string $latitude,

        public readonly string $longitude,

        public readonly ?string $name = null,

        public readonly ?string $contact = null,

        public readonly string $location,

        public readonly ?array $reportFiles,

        public readonly ?string $userId = null,

    ) {
    }

}
