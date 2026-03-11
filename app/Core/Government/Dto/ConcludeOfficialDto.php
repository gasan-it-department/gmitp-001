<?php

namespace App\Core\Government\Dto;

use App\Core\Government\Enums\AppointmentStatus;

readonly class ConcludeOfficialDto
{

    public function __construct(
        public string $actualEndDate,
        public AppointmentStatus $status,
    ) {
    }

    public static function fromRequest(array $data)
    {

        return new self(
            actualEndDate: $data['actual_end_date'],
            status: AppointmentStatus::from($data['status']),
        );

    }

}