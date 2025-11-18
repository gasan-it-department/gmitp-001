<?php

declare(strict_types=1);

namespace App\Core\Users\UseCases;

use App\Core\Users\Repository\UserRepository;

class CreateAdminUseCase
{
    public function __construct(
        protected UserRepository $userRepo,
    ) {
    }

    public function execute()
    {
        $admin = $this->userRepo->save();
    }
}