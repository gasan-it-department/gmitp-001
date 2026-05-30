<?php

namespace App\External\Api\Resources\Announcement;

use Illuminate\Http\Request;

/**
 * Public-facing list row. Strips author/audit/lifecycle data and exposes
 * only a single cover image URL for the news-feed card.
 */
class ClientAnnouncementListResource extends AnnouncementBaseResource
{
    public function toArray(Request $request): array
    {
        $cover = $this->getFirstMedia('announcement_images');

        return array_merge(parent::toArray($request), [
            'cover_image_url' => $cover
                ? ($cover->disk === 's3'
                    ? $cover->getTemporaryUrl(now()->addMinutes(15))
                    : $cover->getUrl())
                : null,
        ]);
    }
}
