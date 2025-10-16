<?php

namespace App\Core\Users\Application\Services;

use App\Core\Users\Application\Dto\CreateUserDto;
use App\Core\Users\Domains\Interfaces\UserRepositoryInterface;
use App\Core\Users\Domains\Aggregates\UserAggregate;
use Illuminate\Support\Facades\DB;
use App\Core\Users\Domains\Enum\EnumRoles;
use App\Shared\Contracts\IdGeneratorInterface;
use App\Core\Users\Application\Exceptions\UserAlreadyExistExceptions;
use App\Core\Auth\Interfaces\CookieSessionInterface;
use App\Core\Users\Domains\ValueObjects\{
    UserName,
    Phone,
    Password,
    Role,
    FirstName,
    MiddleName,
    LastName,
};
use Illuminate\Support\Str;


class CreateUserService
{
    public function __construct(
        protected UserRepositoryInterface $userRepository,
        protected IdGeneratorInterface $idGenerator,
        private CookieSessionInterface $cookieSessionService

    ) {
    }

    public function create(CreateUserDto $dto): void
    {
        DB::transaction(function () use ($dto) {
            $firstName = new FirstName($dto->first_name);
            $middleName = new MiddleName($dto->middle_name);
            $lastName = new LastName($dto->last_name);
            $phone = new Phone($dto->phone);
            $userName = new UserName($dto->user_name);
            $password = new Password($dto->password);
            $role = new Role(EnumRoles::fromString($dto->role ?? 'client'));

            $this->ensureUserDoesNotExist($userName, $phone);
            $id = $this->idGenerator->generate();
            $user = UserAggregate::create(
                $id,
                $firstName,
                $lastName,
                $middleName,
                $phone,
                $userName,
                $password,
                $role
            );

            $saveduser = $this->userRepository->save($user);
            $this->cookieSessionService->createAuthenticatedSession($saveduser->getId());

        });
    }

    private function ensureUserDoesNotExist(UserName $userName, Phone $phone): void
    {
        if ($this->userRepository->findByUsername($userName) !== null) {
            throw UserAlreadyExistExceptions::withUserName($userName->getValue());
        }

        if ($this->userRepository->findByPhone($phone) !== null) {
            throw UserAlreadyExistExceptions::withPhone($phone->getValue());
        }
    }
}







