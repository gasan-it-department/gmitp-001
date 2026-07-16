<?php

declare(Strict_types=1);

namespace App\Core\Users\UseCases;

use App\Core\Auth\Services\LoginRedirectionService;
use App\Core\Users\Dto\RegisterUserDto;
use App\Core\Users\Enums\EnumRoles;
use App\Core\Users\Events\UserRegistered;
use App\Core\Users\Exceptions\UserAlreadyExistExceptions;
use App\Core\Users\Repository\UserRepository;
use App\Core\Users\Services\PasswordHasherService;
use App\Core\Users\ValueObjects\Phone;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Support\Facades\DB;

class RegisterUserUseCase
{
    public function __construct(
        private UserRepository $userRepository,
        private IdGeneratorInterface $idGenerator,
        private PasswordHasherService $hash,
        private LoginRedirectionService $loginRedirectionService,
    ) {
    }
    public function execute(RegisterUserDto $dto, string $slug)
    {
        return DB::transaction(function () use ($dto, $slug) {

            $userId = $this->idGenerator->generate();

            $password = $this->hash->hash($dto->password);

            $phoneNumber = new Phone($dto->phone);

            $this->ensureUserDoesNotExist($phoneNumber->toString());

            $user = $this->userRepository->save([
                'id' => $userId,
                'firstName' => $dto->firstName,
                'middleName' => $dto->middleName,
                'lastName' => $dto->lastName,
                'phone' => $phoneNumber->toString(),
                'password' => $password,
            ]);

            $user->assignRole(EnumRoles::CLIENT->value);

            UserRegistered::dispatch($user);

            return $user;
        });

    }


    private function ensureUserDoesNotExist(string $phone): void
    {
        if ($this->userRepository->findByPhone($phone) !== null) {
            throw UserAlreadyExistExceptions::withPhone($phone);
        }
    }
}
