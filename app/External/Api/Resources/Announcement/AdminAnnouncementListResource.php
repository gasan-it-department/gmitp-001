<?php

namespace App\External\Api\Resources\Announcement;

use Illuminate\Http\Request;

class AdminAnnouncementListResource extends AnnouncementBaseResource
{
    public function toArray(Request $request): array
    {
        return array_merge(parent::toArray($request), [
            'images_count' => $this->media->count(),
            'updated_at'   => $this->updated_at?->format('M d, Y g:i A'),
            'deleted_at'   => $this->deleted_at?->format('M d, Y g:i A'),
        ]);
    }
}
