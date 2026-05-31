<?php

namespace App\External\Api\Resources\Event\Admin;

use App\External\Api\Resources\Event\EventBaseResource;
use Illuminate\Http\Request;

class AdminEventListResource extends EventBaseResource
{
    public function toArray(Request $request): array
    {
        $banner = $this->getFirstMedia('event_banner');

        return array_merge(parent::toArray($request), [
            'banner_url' => $banner
                ? ($banner->disk === 's3'
                    ? $banner->getTemporaryUrl(now()->addMinutes(15))
                    : $banner->getUrl())
                : null,
            'updated_at' => $this->updated_at?->format('M d, Y g:i A'),
            'deleted_at' => $this->deleted_at?->format('M d, Y g:i A'),
        ]);
    }
}
