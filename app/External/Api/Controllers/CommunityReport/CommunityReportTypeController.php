<?php

namespace App\External\Api\Controllers\CommunityReport;

use App\Core\CommunityReport\Services\GetCommunityReportTypeService;

class CommunityReportTypeController
{

    public function getCommunityReportType(GetCommunityReportTypeService $service)
    {

        return response()->json([

            'type' => $service->ReportTypeOption()

        ]);

    }

}