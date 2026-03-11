<?php

namespace App\Core\Government\Dto;

use App\Core\Government\Enums\AppointmentStatus;
use App\External\Api\Request\Government\UpdateHistoryRequest;

readonly class UpdateAppointmentHistoryDto
{

    public function __construct(
        public string $actualStartDate,
        public string $actualEndDate,
        public AppointmentStatus $status,
        public ?string $remarks,
    ) {

    }

    public static function fromRequest(UpdateHistoryRequest $request)
    {

        $validated = $request->validated();

        return new self(
            actualStartDate: $validated['actual_start_date'],
            actualEndDate: $validated['actual_end_date'],
            status: AppointmentStatus::from($validated['status']),
            remarks: $validated['remarks'] ?? null,
        );

    }
}