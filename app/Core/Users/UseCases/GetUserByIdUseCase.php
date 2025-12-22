<?php

namespace App\Core\Users\UseCases;

use App\Core\Users\Repository\UserRepository;

class GetUserByIdUseCase
{
    public function __construct(

        protected UserRepository $userRepo,

    ) {
    }

    public function execute(string $userId)
    {

        return $this->userRepo->findById($userId);

    }
}