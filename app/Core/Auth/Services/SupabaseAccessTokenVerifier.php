<?php

namespace App\Core\Auth\Services;

use App\Core\Auth\Dto\SupabaseUserDto;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class SupabaseAccessTokenVerifier
{
    public function verify(string $accessToken): SupabaseUserDto
    {
        $supabaseUrl = config('services.supabase.url');
        $supabaseAnonKey = config('services.supabase.anon_key');

        if (! $supabaseUrl || ! $supabaseAnonKey) {
            abort(500, 'Supabase authentication is not configured.');
        }

        try {
            $response = Http::withToken($accessToken)
                ->withHeaders([
                    'apikey' => $supabaseAnonKey,
                    'Accept' => 'application/json',
                ])
                ->get(rtrim($supabaseUrl, '/').'/auth/v1/user');
        } catch (ConnectionException) {
            abort(503, 'Unable to connect to Supabase authentication service.');
        }

        if ($response->unauthorized() || $response->forbidden()) {
            abort(401, 'Invalid Supabase access token.');
        }

        if (! $response->successful()) {
            abort(502, 'Supabase authentication service rejected the request.');
        }

        $supabaseUser = $response->json();

        if (! is_array($supabaseUser)) {
            abort(502, 'Supabase authentication returned an invalid response.');
        }

        $providerId = Arr::get($supabaseUser, 'id');

        if (! is_string($providerId) || ! Str::isUuid($providerId)) {
            abort(502, 'Supabase authentication returned an invalid user identifier.');
        }

        $metadata = Arr::get($supabaseUser, 'user_metadata', []);
        $metadata = is_array($metadata) ? $metadata : [];
        $fullName = Arr::get($metadata, 'full_name') ?? Arr::get($metadata, 'name');
        [$firstName, $lastName] = $this->splitName($this->nullableString($fullName));

        return new SupabaseUserDto(
            providerId: $providerId,
            email: $this->nullableString(Arr::get($supabaseUser, 'email')),
            phone: $this->nullableString(Arr::get($supabaseUser, 'phone')),
            phoneConfirmed: $this->nullableString(Arr::get($supabaseUser, 'phone_confirmed_at')) !== null,
            firstName: $this->nullableString(Arr::get($metadata, 'first_name')) ?? $firstName,
            lastName: $this->nullableString(Arr::get($metadata, 'last_name')) ?? $lastName,
            avatarUrl: $this->nullableString(Arr::get($metadata, 'avatar_url'))
                ?? $this->nullableString(Arr::get($metadata, 'picture')),
        );
    }

    /**
     * @return array{0: string|null, 1: string|null}
     */
    private function splitName(?string $fullName): array
    {
        if ($fullName === null) {
            return [null, null];
        }

        $parts = explode(' ', $fullName, 2);

        return [
            $parts[0] ?? null,
            $parts[1] ?? null,
        ];
    }

    private function nullableString(mixed $value): ?string
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        return trim($value);
    }
}
