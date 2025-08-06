<?php

namespace App\Core\Users\Application\Service;
use App\Core\Users\Application\Dto\CreateUserDto;
use App\Core\Users\Domains\Interfaces\UserRepositoryInterface;
use App\Core\Users\Domains\Aggregates\UserAggregate;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Core\Users\Domains\Enum\EnumRoles;
use App\Core\Users\Domains\ValueObjects\{
    UserName,
    Phone,
    Password,
    Role
};

class CreateUserService
{
    public function __construct(
        protected UserRepositoryInterface $userRepository
    ) {
    }

    public function registerUser(CreateUserDto $dto): void
    {
        DB::transaction(function () use ($dto) {
            $user = UserAggregate::register(
                new UserName($dto->user_name),
                new Phone($dto->phone),
                new Password(Hash::make($dto->password)),
                new Role(EnumRoles::fromString($dto->role ?? 'client'))
            );
            $this->userRepository->save($user);
        });
    }
}










