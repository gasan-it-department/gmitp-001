<?php

namespace App\Core\CommunityReport\Actions;

use App\Core\CommunityReport\Models\ReportSubmission;
use Illuminate\Support\Facades\Auth;

class ListMyReportSubmissionAction
{
    public function execute()
    {
        return ReportSubmission::query()
            ->select(['id', 'category', 'status', 'location_text', 'created_at'])
            ->where('municipal_id', app('municipal_id'))
            ->where('user_id', Auth::id())
            ->orderByDesc('created_at')
            ->paginate(10)
            ->through(fn(ReportSubmission $r) => [
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
    }
}