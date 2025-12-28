<?php

namespace App\Core\Users\UseCases;

use App\Core\Users\Interfaces\PasswordHasherInterface;
use App\Core\Users\Repository\UserRepository;
use App\Shared\Phone\Services\PhoneFormatterService;

class UpdatePasswordUseCase
{

    public function __construct(
        protected UserRepository $userRepo,
        protected PhoneFormatterService $phoneFormatterService,
        protected PasswordHasherInterface $passwordHasherInterface
    ) {
    }

    public function execute(string $phone, string $newPassword)
    {

        $normalizePhone = $this->phoneFormatterService->normalize($phone);

        $user = $this->userRepo->findByPhone($normalizePhone);

        $user->password = $this->passwordHasherInterface->hash($newPassword);

        $user->setRememberToken(\Illuminate\Support\Str::random(60));

        $user->save();

        return $user;

    }

}