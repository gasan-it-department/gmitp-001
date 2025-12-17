<?php

namespace App\Core\Users\UseCases;

use App\Core\Users\Repository\UserRepository;

class GetAllUsersUseCase
{

    public function __construct(
        protected UserRepository $userRepo,
    ) {
    }

    public function execute()
    {

        return $this->userRepo->getAll();

    }

}