<?php

namespace App\Shared\Sms\Contracts;

interface SmsProviderInterface
{

    public function send(string $phoneNumber, string $message): ?array;

}