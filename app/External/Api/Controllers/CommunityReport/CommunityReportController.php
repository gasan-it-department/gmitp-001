<?php

namespace App\External\Api\Controllers\CommunityReport;

use Exception;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Core\CommunityReport\Dto\CreateReportDto;
use App\Core\CommunityReport\Dto\CommunityReportQueryDto;
use App\Core\CommunityReport\UseCases\CreateReportUseCase;
use App\Core\CommunityReport\UseCases\ResolvedReportUseCase;
use App\Core\CommunityReport\UseCases\GetCommunityReportUseCase;
use App\External\Api\Request\CommunityReport\CommunityReportRequest;

class CommunityReportController extends Controller
{

    public function __construct(

        protected CreateReportUseCase $createReport,

        private GetCommunityReportUseCase $getCommunityReportUseCase,

        private ResolvedReportUseCase $resolvedReportUseCase,

    ) {
    }

    public function store(CommunityReportRequest $request)
    {
        $userId = auth()->id();

        $municipalId = app('municipal_id');

        $validated = $request->validated();

        $files = $request->hasFile('files') ? $request->file('files') : [];

        $dto = new CreateReportDto(
            $validated['issue_type'],
            $validated['description'],
            $validated['latitude'] ?? null,
            $validated['longitude'] ?? null,
            $validated['sender_name'] ?? null,
            $validated['contact'] ?? null,
            $validated['location'],
            $files,
            $userId ?? null,

        );

        $report = $this->createReport->execute($municipalId, $dto);

        return response()->json([

            'success' => true,

            'message' => 'Report Submitted'
            ,
            'data' => $report,

        ], 200);

    }

    public function fetch(Request $request)
    {

        $municipalId = app('municipal_id');

        $dto = new CommunityReportQueryDto(
            perPage: $request->input('per_page', 10),
            orderBy: $request->input('orderBy', 'created_at'),
            direction: $request->input('direction', 'desc'),
        );

        $communityReport = $this->getCommunityReportUseCase->execute($dto, $municipalId);

        return response()->json([

            'success' => true,

            'message' => 'showing community report data',

            'data' => $communityReport,

        ], 200);
    }

    public function update()
    {

    }

    public function destroy()
    {

    }

    public function resolve($reportId)
    {
        try {

            $municipalId = app('municipal_id');

            $this->resolvedReportUseCase->execute($reportId, $municipalId);

            return response()->json([

                'success' => true,

                'message' => 'Report Resolve'

            ]);
        } catch (Exception $e) {

            return response()->json([

                'success' => false,

                'message' => $e->getMessage()

            ]);
        }

    }
}