<?php

namespace App\Core\Auth\Services;

use Exception;
use Carbon\Carbon;
use App\Core\Auth\Models\VerificationCode;
use Illuminate\Support\Facades\RateLimiter;
use App\Shared\Sms\Contracts\SmsProviderInterface;
use App\Core\Auth\Exceptions\OtpThrottledException;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;

class OtpService
{
    const PURPOSE_REGISTER = 'account_register';
    const PURPOSE_FORGOT_PASSWORD = 'reset_password';
    const UPDATE_PHONE_NUMBER = 'update_phone';
    const OTP_EXPIRY_MINUTES = 10;
    const THROTTLE_SECONDS = 60;

    public function __construct(

        protected IdGeneratorInterface $idGeneratorInterface,

        protected SmsProviderInterface $smsProvider, // 1. Inject SMS Provider here

    ) {
    }

    public function generate(string $phoneNumber, string $purpose, string $channel = 'sms'): string
    {

        $key = "otp-limit:{$purpose}:{$phoneNumber}";

        if (RateLimiter::tooManyAttempts($key, 1)) {

            $seconds = RateLimiter::availableIn($key);

            throw new OtpThrottledException($seconds);

        }

        VerificationCode::where('receiver', $phoneNumber)
            ->where('purpose', $purpose)
            ->delete();

        $code = random_int(100000, 999999);

        $otpId = $this->idGeneratorInterface->generate();


        VerificationCode::create([

            'id' => $otpId,

            'purpose' => $purpose,

            'receiver' => $phoneNumber,

            'channel' => $channel,

            'code' => $code,

            'expires_at' => Carbon::now()->addMinutes(self::OTP_EXPIRY_MINUTES),

        ]);

        RateLimiter::hit($key, self::THROTTLE_SECONDS);

        $this->sendOtpSms($phoneNumber, $code, $purpose);

        return $code;

    }

    public function getTimeRemaining(string $phoneNumber, string $purpose): int
    {
        $key = "otp-limit:{$purpose}:{$phoneNumber}";

        return RateLimiter::availableIn($key);
    }

    public function resend(string $phoneNumber, string $purpose, string $channel = 'sms', )
    {

        return $this->generate($phoneNumber, $purpose, $channel);

    }

    public function validate(string $phoneNumber, string $inputCode, string $purpose, string $channel = 'sms'): bool
    {

        $record = VerificationCode::where('receiver', $phoneNumber)
            ->where('channel', $channel)
            ->where('purpose', $purpose)
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

    public function sendOtpSms(string $phone, string $code, string $purpose)
    {

        $senderName = config('app.sms_sender_name');

        $message = match ($purpose) {

            self::PURPOSE_REGISTER => "{$senderName}: Your Verification Code is: {$code}. Do not share this with anyone.",
            self::PURPOSE_FORGOT_PASSWORD => "{$senderName}: Your password reset code is: {$code}. Valid for 10 minutes.",
            self::UPDATE_PHONE_NUMBER => "Secure Code: {$code} to verify your new number.",

        };

        $this->smsProvider->send($phone, $message);

    }

}