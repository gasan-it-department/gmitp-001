<?php

namespace App\Core\ActionCenter\Services;

use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Shared\Sms\Contracts\SmsProviderInterface;
use Closure;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class AssistanceRequestSmsNotifier
{
    public function __construct(
        private readonly SmsProviderInterface $smsProvider,
    ) {}

    public function requestReceived(AssistanceRequest $request): void
    {
        $this->notify(
            $request,
            'request_received',
            fn (string $office, string $reference): string => sprintf(
                '%s: Natanggap ang request mo (%s). Dalhin sa MSWD ang required documents. Hintayin ang update.',
                $office,
                $reference,
            ),
        );
    }

    public function reviewStarted(AssistanceRequest $request): void
    {
        $message = $request->encoded_by_user_id === null
            ? '%s: Sinusuri na ang request mo (%s). Pumunta sa MSWD para sa interview, verification, at further processing. Dalhin ang transaction number at required original documents.'
            : '%s: Sinusuri na ang request mo (%s). Hintayin ang susunod na update.';

        $this->notify(
            $request,
            'review_started',
            fn (string $office, string $reference): string => sprintf(
                $message,
                $office,
                $reference,
            ),
        );
    }

    public function requestApproved(AssistanceRequest $request): void
    {
        $this->notify(
            $request,
            'request_approved',
            fn (string $office, string $reference): string => sprintf(
                '%s: Naaprubahan ang request mo (%s). Hintayin ang abiso ng MSWD para sa release.',
                $office,
                $reference,
            ),
        );
    }

    public function requestRejected(AssistanceRequest $request): void
    {
        $this->notify(
            $request,
            'request_rejected',
            fn (string $office, string $reference): string => sprintf(
                '%s: Hindi naaprubahan ang request mo (%s). Tingnan ang portal o makipag-ugnayan sa MSWD.',
                $office,
                $reference,
            ),
        );
    }

    public function requestReleased(AssistanceRequest $request): void
    {
        $this->notify(
            $request,
            'request_released',
            fn (string $office, string $reference): string => sprintf(
                '%s: Naitala nang released ang assistance mo (%s). Kung hindi ito natanggap, tawagan agad ang MSWD.',
                $office,
                $reference,
            ),
        );
    }

    /**
     * The beneficiary is the contact person for both self-filed and
     * on-behalf requests. SMS is advisory and must never alter workflow state.
     */
    private function notify(
        AssistanceRequest $request,
        string $notification,
        Closure $message,
    ): void {
        try {
            $request->loadMissing('beneficiary');
            $phone = $request->beneficiary?->contact_phone;

            if (blank($phone)) {
                return;
            }

            $response = $this->smsProvider->send(
                $phone,
                $message($this->officeName($request), $this->reference($request)),
            );

            if ($response === null) {
                Log::warning('Action Center assistance-request SMS was not delivered.', [
                    'assistance_request_id' => $request->id,
                    'beneficiary_id' => $request->beneficiary_id,
                    'municipal_id' => $request->municipal_id,
                    'notification' => $notification,
                ]);
            }
        } catch (Throwable $exception) {
            Log::error('Action Center assistance-request SMS failed unexpectedly.', [
                'assistance_request_id' => $request->id,
                'beneficiary_id' => $request->beneficiary_id,
                'municipal_id' => $request->municipal_id,
                'notification' => $notification,
                'exception' => $exception->getMessage(),
            ]);
        }
    }

    private function officeName(AssistanceRequest $request): string
    {
        try {
            $municipalityName = DB::table('municipalities')
                ->where('id', $request->municipal_id)
                ->value('name');
        } catch (Throwable) {
            $municipalityName = null;
        }

        return filled($municipalityName)
            ? 'MSWD '.trim((string) $municipalityName)
            : 'MSWD';
    }

    private function reference(AssistanceRequest $request): string
    {
        return filled($request->transaction_number)
            ? (string) $request->transaction_number
            : (string) $request->id;
    }
}
