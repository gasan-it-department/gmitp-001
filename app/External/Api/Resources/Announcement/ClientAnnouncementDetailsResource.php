<?php

namespace App\External\Api\Resources\Announcement;

use Illuminate\Http\Request;

/**
 * Public-facing detail payload. URLs only on images (no internal IDs, mime,
 * or size). No author, no audit, no lifecycle timestamps beyond created_at.
 */
class ClientAnnouncementDetailsResource extends AnnouncementBaseResource
{
    public function toArray(Request $request): array
    {
        return array_merge(parent::toArray($request), [
            'content' => $this->content,

            'images' => $this->getMedia('announcement_images')->map(fn ($m) => [
                'url' => $m->disk === 's3'
                    ? $m->getTemporaryUrl(now()->addMinutes(15))
                    : $m->getUrl(),
            ])->values(),
        ]);
    }
}
