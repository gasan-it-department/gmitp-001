<?php

namespace App\External\Web\Controllers\CommunityReport\Client;

use App\Core\CommunityReport\Models\ReportSubmission;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ListReportsController extends Controller
{
    public function __invoke(): Response
    {
        $reports = ReportSubmission::query()
            ->select(['id', 'category', 'status', 'location_text', 'created_at'])
            ->where('municipal_id', app('municipal_id'))
            ->where('user_id', Auth::id())
            ->orderByDesc('created_at')
            ->paginate(10)
            ->through(fn (ReportSubmission $r) => [
                'id' => $r->id,
                'category' => [
                    'value' => $r->category->value,
                    'label' => $r->category->label(),
                ],
                'status' => [
                    'value' => $r->status->value,
                    'label' => $r->status->label(),
                ],
                'location_text' => $r->location_text,
                'created_at' => $r->created_at?->format('M d, Y g:i A'),
            ]);

        return Inertia::render('CitizenReport/Client/List', [
            'reports' => $reports,
        ]);
    }
}
