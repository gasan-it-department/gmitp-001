<?php

namespace App\External\Web\Controllers\CommunityReport;

use App\External\Api\Resources\CommunityReport\CommunityReportResource;
use inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Core\CommunityReport\Dto\CommunityReportQueryDto;
use App\Core\CommunityReport\UseCases\GetCommunityReportUseCase;
use Illuminate\Http\Request;

class CommunityReportAdminController extends Controller
{

    public function index(Request $request, GetCommunityReportUseCase $getCommunityReportUseCase)
    {

        $municipalId = app('municipal_id');

        $dto = CommunityReportQueryDto::fromRequest($request);

        $reports = $getCommunityReportUseCase->execute($dto, $municipalId);

        return Inertia::render('CitizenReport/Admin/CommunityReportsPage', [

            'reports' => CommunityReportResource::collection($reports),

        ]);

    }

}