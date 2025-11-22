<?php

namespace App\External\Api\Controllers\CommunityReport;

use App\Core\CommunityReport\Dto\CreateReportDto;
use App\Core\CommunityReport\UseCases\CreateReportUseCase;
use App\Http\Controllers\Controller;
use App\External\Api\Request\CommunityReport\CommunityReportRequest;

class CommunityReportController extends Controller
{

    public function __construct(
        protected CreateReportUseCase $createReport,
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
            $validated['latitude'],
            $validated['longitude'],
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

    public function fetch()
    {

    }

    public function update()
    {

    }

    public function destroy()
    {

    }
}