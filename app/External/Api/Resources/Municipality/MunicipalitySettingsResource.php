<?php

namespace App\External\Api\Resources\Municipality;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MunicipalitySettingsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $logo = $this->getFirstMedia('logo');

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,

            'settings' => [
                'primary_color_hex' => optional($this->settings)->primary_color_hex,
                'contact_email' => optional($this->settings)->contact_email,
                'trunkline_phone' => optional($this->settings)->trunkline_phone,
                'office_hours' => optional($this->settings)->office_hours,
                'facebook_url' => optional($this->settings)->facebook_url,
            ],

            'logo_url' => $logo ? $this->resolveMediaUrl($logo, 'optimized_logo') : null,

            'banner_urls' => $this->getMedia('banners')->map(fn(Media $m) => [
                'id' => $m->id,
                'name' => $m->file_name,
                'url' => $this->resolveMediaUrl($m, 'optimized_banner'),
            ])->values(),
        ];
    }

    private function resolveMediaUrl(Media $media, string $conversion = ''): string
    {
        return $media->disk === 's3'
            ? $media->getTemporaryUrl(now()->addMinutes(15), $conversion)
            : $media->getUrl($conversion);
    }
}
