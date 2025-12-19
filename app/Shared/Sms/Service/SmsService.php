<?php

namespace App\Shared\Sms\Service;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class SmsService
{
    protected string $baseUrl = 'https://api.semaphore.co/api/v4/messages';
    protected string $apiKey;
    protected string $senderName;

    public function __construct()
    {
        $this->apiKey = config('services.semaphore.key');
        $this->senderName = config('services.semaphore.sender_name');
    }

    /**
     * Send an SMS to a specific number.
     * * @param string $phoneNumber (e.g., 09171234567)
     * @param string $message
     * @return array|null Returns response data on success, null on failure
     */
    public function send(string $phoneNumber, string $message): ?array
    {
        try {
            $response = Http::post($this->baseUrl, [
                'apikey' => $this->apiKey,
                'number' => $phoneNumber,
                'message' => $message,
                'sendername' => $this->senderName,
            ]);

            if ($response->successful()) {
                Log::info("SMS sent to {$phoneNumber}");
                return $response->json();
            } else {
                Log::error("Semaphore SMS Failed: " . $response->body());
                return null;
            }
        } catch (\Exception $e) {
            Log::error("Semaphore Connection Error: " . $e->getMessage());
            return null;
        }
    }
}