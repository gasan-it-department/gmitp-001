<?php

namespace App\External\Api\Resources\ReportSubmission;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Admin-facing list row. Includes the reporter's real name even when
 * is_anonymous is true — admins need accountability data. The frontend
 * is responsible for showing an "Anonymous to Public" chip when applicable
 * so this name never leaks onto public-facing displays.
 */
class AdminReportListResource extends JsonResource
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
            'is_anonymous'  => (bool) $this->is_anonymous,
            'reporter'      => $this->whenLoaded('user', fn () => $this->user ? [
                'id'        => $this->user->id,
                'full_name' => $this->user->full_name,
            ] : null),
            'is_archived'   => $this->trashed(),
            'archived_at'   => $this->deleted_at?->format('M d, Y g:i A'),
            'created_at'    => $this->created_at?->format('M d, Y g:i A'),
        ];
    }
}
