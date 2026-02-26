<?php

namespace App\Core\Government\Exceptions;

use DomainException;
use Illuminate\Validation\ValidationException;
class OfficialAlreadyAppointedException extends DomainException
{

    public function __construct()
    {

        parent::__construct("Official already assigned to this term.");

    }

    public function render($request)
    {

        if ($request->header('X-Inertia')) {
            throw ValidationException::withMessages([
                'official_id' => $this->getMessage(),
            ]);
        }

        return false;
    }

}