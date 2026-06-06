<?php

namespace App\External\Web\Controllers\CommunityReport\Client;

use App\Core\CommunityReport\Models\ReportSubmission;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ShowReportController extends Controller
{
    /**
     * Display a single citizen report — strictly scoped by tenant + owner.
     * No Action/DTO layer (CQRS read side): the Eloquent query lives here.
     */
    public function __invoke(string $municipal, string $report_submission): Response
    {
        $report = ReportSubmission::query()
            ->with('media')
            ->where('municipal_id', app('municipal_id'))
            ->where('user_id', Auth::id())
            ->whereKey($report_submission)
            ->firstOrFail();

        $photos = $report->getMedia('report_submission_evidence')->map(fn($m) => [
            'id' => $m->id,
            'name' => $m->file_name,
            'size' => $m->size,
            'mime_type' => $m->mime_type,
            'url' => $m->disk === 's3'
                ? $m->getTemporaryUrl(now()->addMinutes(15))
                : $m->getUrl(),
        ])->values();

        $timeline = [
            [
                'key' => 'submitted',
                'label' => 'Submitted',
                'description' => 'Report received from citizen.',
                'at' => $report->created_at?->format('M d, Y g:i A'),
                'reached' => true,
            ],
            [
                'key' => 'acknowledged',
                'label' => 'Acknowledged',
                'description' => 'Acknowledged by municipal staff.',
                'at' => $report->acknowledged_at?->format('M d, Y g:i A'),
                'reached' => $report->acknowledged_at !== null,
            ],
            [
                'key' => 'in_progress',
                'label' => 'In Progress',
                'description' => 'Work has started on resolving the issue.',
                'at' => $report->in_progress_at?->format('M d, Y g:i A'),
                'reached' => $report->in_progress_at !== null,
            ],
            [
                'key' => 'resolved',
                'label' => 'Resolved',
                'description' => 'Issue marked as resolved.',
                'at' => $report->resolved_at?->format('M d, Y g:i A'),
                'reached' => $report->resolved_at !== null,
            ],
        ];

        // Rejected is a terminal lane outside the main progression.
        if ($report->rejected_at !== null) {
            $timeline[] = [
                'key' => 'rejected',
                'label' => 'Rejected',
                'description' => 'Report was rejected by municipal staff.',
                'at' => $report->rejected_at?->format('M d, Y g:i A'),
                'reached' => true,
            ];
        }

        return Inertia::render('CitizenReport/Client/Show', [
            'report' => [
                'id' => $report->id,
                'category' => ['value' => $report->category->value, 'label' => $report->category->label()],
                'status' => ['value' => $report->status->value, 'label' => $report->status->label()],
                'location_text' => $report->location_text,
                'latitude' => $report->latitude,
                'longitude' => $report->longitude,
                'description' => $report->description,
                'is_anonymous' => $report->is_anonymous,
                'created_at' => $report->created_at?->format('M d, Y g:i A'),
            ],
            'photos' => $photos,
            'timeline' => $timeline,
        ]);
    }
}
