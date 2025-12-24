<?php

namespace App\Core\Auth\Services;

use App\Core\Auth\Exceptions\OtpThrottledException;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Exception;
use Carbon\Carbon;
use App\Core\Auth\Models\VerificationCode;
use Illuminate\Support\Facades\RateLimiter;

class OtpService
{
    const OTP_EXPIRY_MINUTES = 10;
    const THROTTLE_SECONDS = 60;

    public function __construct(

        protected IdGeneratorInterface $idGeneratorInterface,

    ) {
    }

    public function generate(string $phoneNumber, string $channel): string
    {

        $key = 'otp-limit:' . $phoneNumber;

        if (RateLimiter::tooManyAttempts($key, 1)) {

            $seconds = RateLimiter::availableIn($key);

            throw new OtpThrottledException($seconds);

        }

        VerificationCode::where('receiver', $phoneNumber)
            ->where('channel', $channel)
            ->delete();

        $code = random_int(100000, 999999);

        $otpId = $this->idGeneratorInterface->generate();

        VerificationCode::create([

            'id' => $otpId,

            'receiver' => $phoneNumber,

            'channel' => $channel,

            'code' => $code,

            'expires_at' => Carbon::now()->addMinutes(self::OTP_EXPIRY_MINUTES),

        ]);

        RateLimiter::hit($key, self::THROTTLE_SECONDS);

        return (string) $code;

    }

    public function getTimeRemaining(string $phoneNumber): int
    {
        return RateLimiter::availableIn('otp-limit:' . $phoneNumber);

    }

    public function resend(string $phoneNumber, string $channel = 'sms')
    {

        return $this->generate($phoneNumber, $channel);

    }

    public function validate(string $phoneNumber, string $inputCode, string $channel = 'sms'): bool
    {

        $record = VerificationCode::where('receiver', $phoneNumber)
            ->where('channel', $channel)
            ->first();

        if (!$record) {
            return false;
        }

        if ($record->expires_at->isPast()) {
            $record->delete();
            return false;
        }

        if (!hash_equals($record->code, $inputCode)) {
            return false;
        }

        $record->delete();

        return true;

    }

}