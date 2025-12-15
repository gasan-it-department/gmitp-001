<?php

namespace App\External\Web\Controllers\CommunityReport;

use App\Core\CommunityReport\UseCases\ShowReportDetailsUseCase;
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

        return Inertia::render('CitizenReport/Admin/List/CommunityReportsPage', [

            'reports' => CommunityReportResource::collection($reports),

        ]);

    }

    public function show($municipality, $reportId, ShowReportDetailsUseCase $showReportDetailsUseCase)
    {

        $municipalId = app('municipal_id');

        $report = $showReportDetailsUseCase->execute($municipalId, $reportId);

        return Inertia::render('CitizenReport/Admin/Details/ReportDetails', [

            'report' => (new CommunityReportResource($report))->resolve(),

        ]);

    }

}