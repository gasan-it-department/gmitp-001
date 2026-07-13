<?php

namespace App\Core\ActionCenter\Services;

use App\Core\ActionCenter\Models\Beneficiary;
use App\Shared\Sms\Contracts\SmsProviderInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class BeneficiarySmsNotifier
{
    public function __construct(
        private readonly SmsProviderInterface $smsProvider,
    ) {
    }

    public function profileReceived(Beneficiary $beneficiary): void
    {
        $this->send(
            $beneficiary,
            'profile_received',
            sprintf(
                '%s: Natanggap na namin ang iyong beneficiary application%s. '
                .'For review pa ito. Magpapadala kami ng update.',
                $this->officeName($beneficiary),
                $this->reference($beneficiary),
            ),
        );
    }

    public function profileVerified(Beneficiary $beneficiary): void
    {
        $this->send(
            $beneficiary,
            'profile_verified',
            sprintf(
                '%s: Verified na ang beneficiary profile mo%s. '
                .'Maaari ka nang magsumite ng assistance request sa municipal portal.',
                $this->officeName($beneficiary),
                $this->reference($beneficiary),
            ),
        );
    }

    public function profileRejected(Beneficiary $beneficiary): void
    {
        $this->send(
            $beneficiary,
            'profile_rejected',
            sprintf(
                '%s: Hindi na-verify ang beneficiary application mo%s. '
                .'Buksan ang municipal portal para makita ang dahilan at magsumite ng correction.',
                $this->officeName($beneficiary),
                $this->reference($beneficiary),
            ),
        );
    }

    private function send(Beneficiary $beneficiary, string $notification, string $message): void
    {
        if (blank($beneficiary->contact_phone)) {
            return;
        }

        try {
            $response = $this->smsProvider->send($beneficiary->contact_phone, $message);

            if ($response === null) {
                Log::warning('Action Center beneficiary SMS was not delivered.', [
                    'beneficiary_id' => $beneficiary->id,
                    'municipal_id' => $beneficiary->municipal_id,
                    'notification' => $notification,
                ]);
            }
        } catch (Throwable $exception) {
            // SMS is advisory. A provider outage must never roll back or make a
            // successfully completed beneficiary workflow appear to have failed.
            Log::error('Action Center beneficiary SMS failed unexpectedly.', [
                'beneficiary_id' => $beneficiary->id,
                'municipal_id' => $beneficiary->municipal_id,
                'notification' => $notification,
                'exception' => $exception->getMessage(),
            ]);
        }
    }

    private function officeName(Beneficiary $beneficiary): string
    {
        try {
            $municipalityName = DB::table('municipalities')
                ->where('id', $beneficiary->municipal_id)
                ->value('name');
        } catch (Throwable) {
            $municipalityName = null;
        }

        return filled($municipalityName)
            ? 'MSWD '.trim((string) $municipalityName)
            : 'MSWD';
    }

    private function reference(Beneficiary $beneficiary): string
    {
        return filled($beneficiary->beneficiary_number)
            ? sprintf(' (Ref: %s)', $beneficiary->beneficiary_number)
            : '';
    }
}
