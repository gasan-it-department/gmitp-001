<?php

namespace App\Shared\Encryption\Service;

use Illuminate\Support\Facades\Crypt;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Log;

class EncryptionService
{
    public function encrypt(string $data)
    {
        try {

            return Crypt::encrypt($data);

        } catch (\Exception $e) {

            Log::error('encryption failed:' . $e->getMessage());

            return null;

        }
    }

    public function decrypt(string $data)
    {
        try {

        } catch (\Exception $e) {

            Log::error('failed decryption' . $e->getMessage());

            return null;
        }
    }
}