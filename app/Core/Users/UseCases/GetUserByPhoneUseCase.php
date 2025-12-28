<?php

namespace App\Core\Users\UseCases;

use App\Core\Users\Repository\UserRepository;
use App\Core\Users\ValueObjects\Phone;

class GetUserByPhoneUseCase
{

    public function __construct(

        protected UserRepository $userRepository,

    ) {
    }

    public function execute(string $phone)
    {

        $phoneNumber = new Phone($phone);

        return $this->userRepository->findByPhone($phoneNumber);

    }

}