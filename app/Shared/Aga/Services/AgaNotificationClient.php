<?php

namespace App\Shared\Aga\Services;

use App\Shared\Aga\Contracts\AgaNotificationClientInterface;
use App\Shared\Aga\Dto\AgaNotificationDto;
use App\Shared\Aga\Dto\AgaNotificationResultDto;
use App\Shared\Aga\Exceptions\AgaNotificationException;
use Illuminate\Contracts\Config\Repository;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Factory;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AgaNotificationClient implements AgaNotificationClientInterface
{
    public function __construct(
        private Factory $http,
        private Repository $config,
    ) {}

    public function send(AgaNotificationDto $notification): AgaNotificationResultDto
    {
        $settings = $this->config->get('services.aga_notifications', []);
        if (! ($settings['enabled'] ?? false)) {
            throw new AgaNotificationException('AGA notification delivery is disabled.');
        }

        $url = $settings['url'] ?? '';
        $secret = $settings['secret'] ?? '';
        if (! is_string($url) || ! filter_var($url, FILTER_VALIDATE_URL) || parse_url($url, PHP_URL_SCHEME) !== 'https'
            || ! is_string($secret) || trim($secret) === '') {
            throw new AgaNotificationException('AGA notification server configuration is incomplete.');
        }

        // Capture the destination in the DTO/job; a queued test message cannot become a live broadcast after a config change.
        if (! in_array($notification->schema, ['test', 'app_main_schema'], true)
            || $notification->schema !== ($settings['schema'] ?? 'test')) {
            throw new AgaNotificationException('AGA notification schema does not match the configured destination.');
        }

        $payload = $notification->toArray();
        $validator = Validator::make($payload, [
            'audience' => ['required', Rule::in(['all', 'specific'])],
            'event_type' => ['sometimes', 'string'],
            'title' => ['required', 'string'],
            'message' => ['required', 'string'],
            'user_ids' => ['required_if:audience,specific', 'array', 'min:1'],
            'user_ids.*' => ['required', 'string', 'uuid'],
            'image_url' => ['sometimes', 'url:https'],
        ]);
        if ($validator->fails() || ($notification->audience !== 'specific' && $notification->userIds !== [])) {
            throw new AgaNotificationException('Invalid AGA notification payload or audience.');
        }

        if ($notification->audience === 'specific') {
            $payload['user_ids'] = array_values(array_unique($payload['user_ids']));
        }

        $timeout = max(1, min(15, (int) ($settings['timeout'] ?? 10)));
        try {
            $response = $this->http->acceptJson()->asJson()
                ->withHeaders(['x-external-notification-secret' => $secret])
                ->withOptions(['allow_redirects' => false])
                ->connectTimeout(min(3, $timeout))->timeout($timeout)
                ->post($url, $payload);
        } catch (ConnectionException) {
            // Do not include the request, secret header, response body, or original exception in failure logs.
            throw new AgaNotificationException('AGA notification transport failed; delivery outcome is unknown. Review before retrying.');
        }

        if (! $response->successful()) {
            throw new AgaNotificationException('AGA notification endpoint returned HTTP '.$response->status().'. Review before retrying.');
        }

        $data = $response->json();
        if (! is_array($data) || ! is_bool($data['ok'] ?? null)
            || ($data['schema'] ?? null) !== $notification->schema
            || ($data['audience'] ?? null) !== $notification->audience) {
            throw new AgaNotificationException('Invalid AGA notification response; delivery outcome is unknown.');
        }
        foreach (['devices', 'sent', 'failed'] as $key) {
            if (! is_int($data[$key] ?? null) || $data[$key] < 0) {
                throw new AgaNotificationException('Invalid AGA notification delivery counts; review before retrying.');
            }
        }
        if (! is_array($data['invalidTokens'] ?? null) || ! is_array($data['errors'] ?? null)) {
            throw new AgaNotificationException('Invalid AGA notification delivery details; review before retrying.');
        }

        return new AgaNotificationResultDto(
            $data['ok'], $data['schema'], $data['audience'], $data['devices'], $data['sent'], $data['failed'],
            $data['invalidTokens'], $data['errors'],
        );
    }
}
