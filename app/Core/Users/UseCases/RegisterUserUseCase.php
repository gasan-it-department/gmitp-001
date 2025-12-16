<?php

declare(Strict_types=1);

namespace App\Core\Users\UseCases;

use App\Core\Auth\Interfaces\CookieSessionInterface;
use App\Core\Auth\Services\LoginRedirectionService;
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
        private LoginRedirectionService $loginRedirectionService,
    ) {
    }
    public function execute(RegisterUserDto $dto, string $slug)
    {
        return DB::transaction(function () use ($dto, $slug) {

            $userId = $this->idGenerator->generate();

            $password = $this->hash->hash($dto->password);

            $user = $this->userRepository->save([
                'id' => $userId,
                'firstName' => $dto->firstName,
                'middleName' => $dto->middleName,
                'lastName' => $dto->lastName,
                'userName' => $dto->userName,
                'phone' => $dto->phone,
                'password' => $password,
            ]);

            $user->assignRole(EnumRoles::CLIENT->value);

            $session = $this->cookieSessionService->createAuthenticatedSession($userId);

            $redirect = $this->loginRedirectionService->redirectUser($user, $slug);

            return [
                'result' => $session,
                'redirect' => $redirect,
            ];
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