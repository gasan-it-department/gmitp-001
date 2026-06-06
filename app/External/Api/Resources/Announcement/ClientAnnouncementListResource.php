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
        $media = $this->getMedia('announcement_images');
        $cover = $media->first();

        return array_merge(parent::toArray($request), [
            'content' => $this->content,
            'cover_image_url' => $cover
                ? ($cover->disk === 's3'
                    ? $cover->getTemporaryUrl(now()->addMinutes(15), 'optimized')
                    : $cover->getUrl('optimized'))
                : null,
            'images' => $media->map(fn ($m) => [
                'url' => $m->disk === 's3'
                    ? $m->getTemporaryUrl(now()->addMinutes(15), 'optimized')
                    : $m->getUrl('optimized'),
            ])->values(),
        ]);
    }
}
