<?php

namespace App\External\Api\Resources\ReportSubmission;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Admin-facing detail payload. Extends the list shape with description,
 * coordinates, evidence photos (signed S3 URLs), lifecycle timestamps,
 * and the audit log of Spatie activitylog entries.
 *
 * Lifecycle timestamps are exposed raw so the frontend can compose a
 * tracking-trail timeline client-side. The audit log is exposed for a
 * future audit panel but is not consumed by the timeline.
 */
class AdminReportDetailsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'category'      => [
                'value' => $this->category->value,
                'label' => $this->category->label(),
            ],
            'status'        => [
                'value' => $this->status->value,
                'label' => $this->status->label(),
            ],
            'location_text' => $this->location_text,
            'latitude'      => $this->latitude,
            'longitude'     => $this->longitude,
            'description'   => $this->description,
            'is_anonymous'  => (bool) $this->is_anonymous,
            'is_archived'   => $this->trashed(),
            'reporter'      => $this->whenLoaded('user', fn () => $this->user ? [
                'id'        => $this->user->id,
                'full_name' => $this->user->full_name,
            ] : null),

            'created_at'      => $this->created_at?->format('M d, Y g:i A'),
            'acknowledged_at' => $this->acknowledged_at?->format('M d, Y g:i A'),
            'in_progress_at'  => $this->in_progress_at?->format('M d, Y g:i A'),
            'resolved_at'     => $this->resolved_at?->format('M d, Y g:i A'),
            'rejected_at'     => $this->rejected_at?->format('M d, Y g:i A'),
            'archived_at'     => $this->deleted_at?->format('M d, Y g:i A'),

            'evidence_photos' => $this->getMedia('report_submission_evidence')->map(fn ($m) => [
                'id'        => $m->id,
                'name'      => $m->file_name,
                'mime_type' => $m->mime_type,
                'size'      => $m->size,
                'url'       => $m->disk === 's3'
                    ? $m->getTemporaryUrl(now()->addMinutes(15))
                    : $m->getUrl(),
            ])->values(),

            'audit_log' => $this->whenLoaded('activities', fn () => $this->activities->map(fn ($a) => [
                'id'          => $a->id,
                'event'       => $a->event,
                'description' => $a->description,
                'properties'  => $a->properties,
                'causer_id'   => $a->causer_id,
                'created_at'  => $a->created_at?->format('M d, Y g:i A'),
            ])->values()),
        ];
    }
}
