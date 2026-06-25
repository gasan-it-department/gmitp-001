<?php

namespace App\External\Api\Controllers\V1\CommunityReport;

use App\Core\CommunityReport\Actions\GetMyReportSubmissionDetailsAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class ShowMyReportController extends Controller
{
    public function __construct(
        private GetMyReportSubmissionDetailsAction $getMyReportSubmissionDetails,
    ) {
    }

    public function __invoke(string $report): JsonResponse
    {
        $reportSubmission = $this->getMyReportSubmissionDetails->execute($report);

        return response()->json([
            'data' => [
                'report' => [
                    'id' => $reportSubmission->id,
                    'category' => [
                        'value' => $reportSubmission->category->value,
                        'label' => $reportSubmission->category->label(),
                    ],
                    'status' => [
                        'value' => $reportSubmission->status->value,
                        'label' => $reportSubmission->status->label(),
                    ],
                    'location_text' => $reportSubmission->location_text,
                    'latitude' => $reportSubmission->latitude,
                    'longitude' => $reportSubmission->longitude,
                    'description' => $reportSubmission->description,
                    'is_anonymous' => (bool) $reportSubmission->is_anonymous,
                    'created_at' => $reportSubmission->created_at?->format('M d, Y g:i A'),
                ],
                'photos' => $reportSubmission
                    ->getMedia('report_submission_evidence')
                    ->map(fn ($media) => [
                        'id' => $media->id,
                        'name' => $media->file_name,
                        'size' => $media->size,
                        'mime_type' => $media->mime_type,
                        'url' => $media->disk === 's3'
                            ? $media->getTemporaryUrl(now()->addMinutes(15))
                            : $media->getUrl(),
                    ])
                    ->values(),
                'timeline' => $this->timeline($reportSubmission),
            ],
        ]);
    }

    private function timeline($reportSubmission): array
    {
        $timeline = [
            [
                'key' => 'submitted',
                'label' => 'Submitted',
                'description' => 'Report received from citizen.',
                'at' => $reportSubmission->created_at?->format('M d, Y g:i A'),
                'reached' => true,
            ],
            [
                'key' => 'acknowledged',
                'label' => 'Acknowledged',
                'description' => 'Acknowledged by municipal staff.',
                'at' => $reportSubmission->acknowledged_at?->format('M d, Y g:i A'),
                'reached' => $reportSubmission->acknowledged_at !== null,
            ],
            [
                'key' => 'in_progress',
                'label' => 'In Progress',
                'description' => 'Work has started on resolving the issue.',
                'at' => $reportSubmission->in_progress_at?->format('M d, Y g:i A'),
                'reached' => $reportSubmission->in_progress_at !== null,
            ],
            [
                'key' => 'resolved',
                'label' => 'Resolved',
                'description' => 'Issue marked as resolved.',
                'at' => $reportSubmission->resolved_at?->format('M d, Y g:i A'),
                'reached' => $reportSubmission->resolved_at !== null,
            ],
        ];

        if ($reportSubmission->rejected_at !== null) {
            $timeline[] = [
                'key' => 'rejected',
                'label' => 'Rejected',
                'description' => 'Report was rejected by municipal staff.',
                'at' => $reportSubmission->rejected_at?->format('M d, Y g:i A'),
                'reached' => true,
            ];
        }

        return $timeline;
    }
}
