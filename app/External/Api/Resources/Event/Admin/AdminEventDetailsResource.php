<?php

namespace App\External\Api\Resources\Event\Admin;

use App\External\Api\Resources\Event\EventBaseResource;
use Illuminate\Http\Request;

/**
 * Admin-facing detail payload. Extends the shared base with description,
 * full banner metadata (signed S3 URL), lifecycle timestamps, and the
 * audit log of Spatie activitylog entries.
 */
class AdminEventDetailsResource extends EventBaseResource
{
    public function toArray(Request $request): array
    {
        $banner = $this->getFirstMedia('event_banner');

        return array_merge(parent::toArray($request), [
            'description' => $this->description,

            // ISO-ish datetime values for HTML datetime-local inputs on the edit form.
            // The parent base resource exposes the human-friendly formatted strings.
            'start_datetime_input' => $this->start_datetime?->format('Y-m-d\TH:i'),
            'end_datetime_input'   => $this->end_datetime?->format('Y-m-d\TH:i'),

            'banner' => $banner ? [
                'id'        => $banner->id,
                'name'      => $banner->file_name,
                'mime_type' => $banner->mime_type,
                'size'      => $banner->size,
                'url'       => $banner->disk === 's3'
                    ? $banner->getTemporaryUrl(now()->addMinutes(15))
                    : $banner->getUrl(),
            ] : null,

            'updated_at' => $this->updated_at?->format('M d, Y g:i A'),
            'deleted_at' => $this->deleted_at?->format('M d, Y g:i A'),

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
