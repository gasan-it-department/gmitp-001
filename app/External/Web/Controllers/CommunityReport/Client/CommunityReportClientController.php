<?php

namespace App\External\Web\Controllers\CommunityReport\Client;

use App\Core\CommunityReport\Dto\CommunityReportQueryDto;
use App\Core\CommunityReport\UseCases\GetUserReportUseCase;
use App\External\Api\Resources\CommunityReport\CommunityReportResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;

class CommunityReportClientController extends Controller
{

    public function index(Request $request, GetUserReportUseCase $getUserReportUseCase)
    {
        $dto = CommunityReportQueryDto::fromRequest($request);

        $reports = $getUserReportUseCase->execute($dto, auth()->user()->id);

        return Inertia::render('CitizenReport/Client/List/CommunityReport', [

            'reports' => CommunityReportResource::collection($reports)

        ]);

    }

}