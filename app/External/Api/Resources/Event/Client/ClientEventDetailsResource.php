<?php

namespace App\External\Api\Resources\Event\Client;

use App\External\Api\Resources\Event\EventBaseResource;
use Illuminate\Http\Request;

/**
 * Public-facing detail payload. Banner URL only (no internal IDs, mime, or
 * size). No audit, no lifecycle timestamps beyond created_at.
 */
class ClientEventDetailsResource extends EventBaseResource
{
    public function toArray(Request $request): array
    {
        $banner = $this->getFirstMedia('event_banner');

        return array_merge(parent::toArray($request), [
            'description' => $this->description,
            'banner_url'  => $banner
                ? ($banner->disk === 's3'
                    ? $banner->getTemporaryUrl(now()->addMinutes(15))
                    : $banner->getUrl())
                : null,
        ]);
    }
}
