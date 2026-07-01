<?php

namespace App\Core\Tourism\Actions;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;

class FetchAgaTourismAction
{
    /**
     * @return array<string, mixed>
     */
    public function execute(int $page = 1, int $perPage = 20): array
    {
        $supabaseUrl = config('services.supabase.url');

        if (! $supabaseUrl) {
            abort(500, 'Supabase tourism service is not configured.');
        }

        $headers = [
            'Accept' => 'application/json',
        ];

        if (filled(config('services.supabase.anon_key'))) {
            $headers['apikey'] = config('services.supabase.anon_key');
            $headers['Authorization'] = 'Bearer '.config('services.supabase.anon_key');
        }

        if (filled(config('services.supabase.edge_secret'))) {
            $headers['x-laravel-secret'] = config('services.supabase.edge_secret');
        }

        try {
            $response = Http::timeout(15)
                ->withHeaders($headers)
                ->get(rtrim($supabaseUrl, '/').'/functions/v1/laravel-tourism', [
                    'page' => $page,
                    'per_page' => $perPage,
                ]);
        } catch (ConnectionException) {
            abort(503, 'Unable to connect to AGA tourism service.');
        }

        if ($response->failed()) {
            abort(502, 'AGA tourism service rejected the request. Please check the Supabase Edge Function secret/configuration.');
        }

        $payload = $response->json();

        return [
            'data' => [
                'tourist_spots' => collect(Arr::get($payload, 'data.tourist_spots.data', []))
                    ->map(fn (array $spot) => $this->normalizeTouristSpot($spot))
                    ->values(),
                'event_banners' => collect(Arr::get($payload, 'data.tourism_event_banners.data', []))
                    ->map(fn (array $banner) => $this->normalizeEventBanner($banner))
                    ->values(),
                'likes' => Arr::get($payload, 'data.tourist_spot_likes.data', []),
                'reviews' => Arr::get($payload, 'data.tourist_spot_review.data', []),
            ],
            'pagination' => [
                'page' => (int) Arr::get($payload, 'pagination.page', $page),
                'per_page' => (int) Arr::get($payload, 'pagination.per_page', $perPage),
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $spot
     * @return array<string, mixed>
     */
    private function normalizeTouristSpot(array $spot): array
    {
        return [
            'id' => Arr::get($spot, 'spot_id'),
            'name' => Arr::get($spot, 'spot_label'),
            'description' => Arr::get($spot, 'spot_description'),
            'images' => $this->decodeJsonValue(Arr::get($spot, 'spot_images'), []),
            'videos' => $this->decodeJsonValue(Arr::get($spot, 'spot_videos'), []),
            'coordinates' => $this->decodeJsonValue(Arr::get($spot, 'spot_coordinates'), null),
            'date_added' => Arr::get($spot, 'spot_date_added'),
            'status' => Arr::get($spot, 'spot_status'),
            'allow_reviews' => (bool) Arr::get($spot, 'spot_allow_reviews'),
            'municipality' => Arr::get($spot, 'spot_municipality'),
        ];
    }

    /**
     * @param  array<string, mixed>  $banner
     * @return array<string, mixed>
     */
    private function normalizeEventBanner(array $banner): array
    {
        return [
            'id' => Arr::get($banner, 'banner_id'),
            'name' => Arr::get($banner, 'banner_name'),
            'description' => Arr::get($banner, 'banner_description'),
            'date_added' => Arr::get($banner, 'banner_date_added'),
            'cover_image' => Arr::get($banner, 'banner_cover_image'),
            'municipal_zipcode' => Arr::get($banner, 'banner_municipal_zipcode'),
        ];
    }

    private function decodeJsonValue(mixed $value, mixed $default): mixed
    {
        if (is_array($value)) {
            return $value;
        }

        if (! is_string($value) || $value === '') {
            return $default;
        }

        $decoded = json_decode($value, true);

        return json_last_error() === JSON_ERROR_NONE ? $decoded : $default;
    }
}
