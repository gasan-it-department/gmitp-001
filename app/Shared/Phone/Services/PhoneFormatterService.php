<?php

namespace App\Shared\Phone\Services;

use App\Core\Users\ValueObjects\Phone;

class PhoneFormatterService
{

    public function normalize(string $rawPhone)
    {

        try {

            $phoneVo = new Phone($rawPhone);

            return $phoneVo->getValue();

        } catch (\Exception $e) {

            return null;
        }

    }

}