<?php

namespace App\External\Api\Controllers\V1\CommunityReport;

use App\Core\CommunityReport\Actions\SubmitReportAction;
use App\Core\CommunityReport\Dto\SubmitReportDto;
use App\External\Api\Request\CommunityReport\SubmitReportRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class StoreReportController extends Controller
{
    public function __construct(
        private SubmitReportAction $submitReport,
    ) {
    }

    public function __invoke(SubmitReportRequest $request): JsonResponse
    {
        $submission = $this->submitReport->execute(
            SubmitReportDto::fromRequest($request, app('municipal_id')),
        );

        return response()->json([
            'message' => 'Report submitted successfully.',
            // 'data' => [
            //     'id' => $submission->id,
            //     'category' => [
            //         'value' => $submission->category->value,
            //         'label' => $submission->category->label(),
            //     ],
            //     'status' => [
            //         'value' => $submission->status->value,
            //         'label' => $submission->status->label(),
            //     ],
            //     'location_text' => $submission->location_text,
            //     'latitude' => $submission->latitude,
            //     'longitude' => $submission->longitude,
            //     'description' => $submission->description,
            //     'is_anonymous' => (bool) $submission->is_anonymous,
            //     'created_at' => $submission->created_at?->toISOString(),
            //     'evidence_photos' => $submission
            //         ->getMedia('report_submission_evidence')
            //         ->map(fn ($media) => [
            //             'id' => $media->id,
            //             'name' => $media->file_name,
            //             'mime_type' => $media->mime_type,
            //             'size' => $media->size,
            //             'url' => $media->disk === 's3'
            //                 ? $media->getTemporaryUrl(now()->addMinutes(15))
            //                 : $media->getUrl(),
            //         ])
            //         ->values(),
            // ],
        ], 201);
    }
}
