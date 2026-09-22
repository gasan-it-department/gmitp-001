<?php

namespace App\Core\ActionCenter\Services;

use App\Core\ActionCenter\Models\AssistanceDisbursement;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\Municipality\Models\Municipality;
use App\Shared\Sms\Contracts\SmsProviderInterface;
use Illuminate\Support\Facades\Log;
use Throwable;

class AssistanceDisbursementSmsNotifier
{
    public function __construct(private readonly SmsProviderInterface $smsProvider) {}

    /** @return array{phone:?string,message:string} */
    public function readyPayload(AssistanceRequest $request, AssistanceDisbursement $disbursement): array
    {
        $request->loadMissing('beneficiary');
        $phone = $request->beneficiary?->contact_phone;
        $message = sprintf(
            '%s: Handa nang i-claim ang assistance mo (%s) sa %s. %s %s',
            $this->officeName($request),
            $request->transaction_number ?: $request->id,
            $disbursement->claim_location_label,
            filled(data_get($disbursement->metadata, 'claim_location.office_hours'))
                ? 'Oras: '.data_get($disbursement->metadata, 'claim_location.office_hours').'.'
                : '',
            $disbursement->claim_instructions ?: 'Dalhin ang valid ID at transaction number.',
        );

        return [
            'phone' => $phone,
            'message' => trim(preg_replace('/\s+/', ' ', $message) ?? $message),
        ];
    }

    /**
     * @param  array{phone:?string,message:string}|null  $payload
     * @return array{status:string,phone:?string,message:string,failure:?string,provider_message_id:?string,provider_status:?string}
     */
    public function ready(
        AssistanceRequest $request,
        AssistanceDisbursement $disbursement,
        ?array $payload = null,
    ): array {
        $payload ??= $this->readyPayload($request, $disbursement);

        return $this->send($request, $payload['phone'], $payload['message'], 'claim_ready');
    }

    /** @return array{status:string,phone:?string,message:string,failure:?string,provider_message_id:?string,provider_status:?string} */
    public function voided(AssistanceRequest $request, AssistanceDisbursement $disbursement): array
    {
        $request->loadMissing('beneficiary');
        $message = sprintf(
            '%s: Kinansela ang naunang claim notice para sa request %s. Huwag munang pumunta; hintayin ang bagong abiso.',
            $this->officeName($request),
            $request->transaction_number ?: $request->id,
        );

        return $this->send($request, $request->beneficiary?->contact_phone, $message, 'claim_notice_cancelled');
    }

    /** @return array{status:string,phone:?string,message:string,failure:?string,provider_message_id:?string,provider_status:?string} */
    private function send(AssistanceRequest $request, ?string $phone, string $message, string $notification): array
    {
        if (blank($phone)) {
            return [
                'status' => 'unavailable',
                'phone' => null,
                'message' => $message,
                'failure' => 'The claimant has no contact number.',
                'provider_message_id' => null,
                'provider_status' => null,
            ];
        }

        try {
            $response = $this->smsProvider->send($phone, $message);
            if ($response !== null) {
                return $this->providerOutcome($phone, $message, $response);
            }

            $failure = 'The SMS provider did not confirm submission.';
        } catch (Throwable $exception) {
            $failure = $exception->getMessage();
        }

        Log::warning('Action Center disbursement SMS was not submitted.', [
            'assistance_request_id' => $request->id,
            'municipal_id' => $request->municipal_id,
            'notification' => $notification,
            'failure' => $failure,
        ]);

        return [
            'status' => 'failed',
            'phone' => $phone,
            'message' => $message,
            'failure' => $failure,
            'provider_message_id' => null,
            'provider_status' => null,
        ];
    }

    /**
     * @param  array<mixed>  $response
     * @return array{status:string,phone:string,message:string,failure:?string,provider_message_id:?string,provider_status:?string}
     */
    private function providerOutcome(string $phone, string $message, array $response): array
    {
        $record = array_is_list($response) ? ($response[0] ?? null) : $response;
        $record = is_array($record) ? $record : [];
        $providerStatus = filled($record['status'] ?? null)
            ? trim((string) $record['status'])
            : null;
        $providerMessageId = filled($record['message_id'] ?? null)
            ? (string) $record['message_id']
            : null;

        $status = match (mb_strtolower((string) $providerStatus)) {
            'sent' => 'sent',
            'failed', 'refunded' => 'failed',
            default => 'submitted',
        };
        $failure = $status === 'failed'
            ? sprintf('Semaphore reported the message as %s.', $providerStatus)
            : null;

        return [
            'status' => $status,
            'phone' => $phone,
            'message' => $message,
            'failure' => $failure,
            'provider_message_id' => $providerMessageId,
            'provider_status' => $providerStatus,
        ];
    }

    private function officeName(AssistanceRequest $request): string
    {
        $name = Municipality::query()->whereKey($request->municipal_id)->value('name');

        return filled($name) ? 'LGU '.trim((string) $name) : 'LGU';
    }
}
