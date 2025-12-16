<?php

namespace App\Core\CommunityReport\Services;

use App\Core\CommunityReport\Enums\CommunityReportType;

class GetCommunityReportTypeService
{

    public function ReportTypeOption(): array
    {

        return array_map(fn(CommunityReportType $type) => [
            'value' => $type->value,
            'label' => $type->label(),
            'color' => $type->color(),
        ], CommunityReportType::cases());

    }

}