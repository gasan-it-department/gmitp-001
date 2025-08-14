<?php

namespace App\Core\Users\Application\Services;

use Illuminate\Support\Facades\Auth;

use App\Core\Users\Application\Dto\CreateUserDto;
use App\Core\Users\Domains\Interfaces\UserRepositoryInterface;
use App\Core\Users\Domains\Aggregates\UserAggregate;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Core\Users\Domains\Enum\EnumRoles;
use App\Core\Users\Application\Interfaces\AuthServiceInterface;
use App\Core\Users\Application\Interfaces\UuidServiceInterface;
use App\Core\Users\Application\Exceptions\UserAlreadyExistExceptions;
use App\Core\Users\Domains\ValueObjects\{
    UserName,
    Phone,
    Password,
    Role,
    Uuid
};

class CreateUserService
{
    public function __construct(
        protected UserRepositoryInterface $userRepository,
        protected AuthServiceInterface $authService,
        protected UuidServiceInterface $uuidGenerator
    ) {
    }

    public function registerUser(CreateUserDto $dto): void
    {
        DB::transaction(function () use ($dto) {


            $phone = new Phone($dto->phone);
            $userName = new UserName($dto->user_name);
            $password = new Password($dto->password);
            $role = new Role(EnumRoles::fromString($dto->role ?? 'client'));

            $this->ensureUserDoesNotExist($userName, $phone);
            $uuid = new Uuid($this->uuidGenerator->generate());

            $user = UserAggregate::register(
                $uuid,
                $phone,
                $userName,
                $password,
                $role
            );

            $saveduser = $this->userRepository->save($user);

            $this->authService->login($saveduser);

            // return new UserCreatedDto(
            //     uuid: $savedUser->getUuid(),
            //     id: $savedUser->getId(),
            //     username: $savedUser->getUsername()->getValue(),
            //     phone: $savedUser->getPhoneNumber()->getValue(),
            //     authToken: $authToken
            // );
        });
    }

    private function ensureUserDoesNotExist(UserName $userName, Phone $phone): void
    {
        // if ($this->userRepository->findByUsername($userName) !== null) {
        //     throw UserAlreadyExistExceptions::withUserName($userName->getValue());
        // }

        // if ($this->userRepository->findByPhone($phone) !== null) {
        //     throw UserAlreadyExistExceptions::withPhone($phone->getValue());
        // }

    }
}







