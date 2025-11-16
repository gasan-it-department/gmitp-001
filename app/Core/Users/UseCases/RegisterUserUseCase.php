<?php

declare(Strict_types=1);

namespace App\Core\Users\UseCases;

use App\Core\Auth\Interfaces\CookieSessionInterface;
use Illuminate\Support\Facades\DB;
use App\Core\Users\Enums\EnumRoles;
use App\Core\Users\Dto\RegisterUserDto;
use App\Core\Users\Repository\UserRepository;
use App\Core\Users\Services\PasswordHasherService;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;

class RegisterUserUseCase
{
    public function __construct(
        private UserRepository $userRepository,
        private IdGeneratorInterface $idGenerator,
        private PasswordHasherService $hash,
        private CookieSessionInterface $cookieSessionService,
    ) {
    }

    public function execute(RegisterUserDto $dto)
    {
        DB::transaction(function () use ($dto) {

            $userId = $this->idGenerator->generate();

            $password = $this->hash->hash($dto->password);

            $role = EnumRoles::CLIENT->value;

            $user = $this->userRepository->save([
                'id' => $userId,
                'firstName' => $dto->firstName,
                'middleName' => $dto->middleName,
                'lastName' => $dto->lastName,
                'userName' => $dto->userName,
                'phone' => $dto->phone,
                'password' => $password,
                'role' => $role,
            ]);

            $this->cookieSessionService->createAuthenticatedSession($userId);

        });

    }


    // private function ensureUserDoesNotExist(UserName $userName, Phone $phone): void
    // {
    //     if ($this->userRepository->findByUsername($userName) !== null) {
    //         throw UserAlreadyExistExceptions::withUserName($userName->getValue());
    //     }

    //     if ($this->userRepository->findByPhone($phone) !== null) {
    //         throw UserAlreadyExistExceptions::withPhone($phone->getValue());
    //     }
    // }
}