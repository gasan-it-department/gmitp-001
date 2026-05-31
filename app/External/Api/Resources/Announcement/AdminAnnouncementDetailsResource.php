<?php

namespace App\External\Api\Resources\Announcement;

use Illuminate\Http\Request;

/**
 * Admin-facing detail payload. Extends the shared base with content body,
 * full image metadata (signed S3 URLs), author info, lifecycle timestamps,
 * and the audit log of Spatie activitylog entries.
 */
class AdminAnnouncementDetailsResource extends AnnouncementBaseResource
{
    public function toArray(Request $request): array
    {
        return array_merge(parent::toArray($request), [
            'content' => $this->content,

            'author' => $this->whenLoaded('user', fn () => $this->user ? [
                'id'         => $this->user->id,
                'first_name' => $this->user->first_name,
                'last_name'  => $this->user->last_name,
                'full_name'  => trim(($this->user->first_name ?? '') . ' ' . ($this->user->last_name ?? '')),
            ] : null),

            'updated_at' => $this->updated_at?->format('M d, Y g:i A'),
            'deleted_at' => $this->deleted_at?->format('M d, Y g:i A'),

            'images' => $this->getMedia('announcement_images')->map(fn ($m) => [
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
        ]);
    }
}
