<?php

namespace App\Core\CitizenReports\Dto;

class CreateReportDto
{
    public function __construct(

        public readonly string $type,

        public readonly string $description,

        public readonly string $latitude,

        public readonly string $longitude,

        public readonly string $status,

        public readonly string $name,

        public readonly string $contact,

        public readonly string $location,

        public readonly ?string $resolved_at = null,

        public readonly ?array $files,
    ) {
    }

}
