<?php

declare(strict_types=1);

namespace App\Core\Users\UseCases;

use App\Core\Users\Dto\CreateAdminDto;
use App\Core\Users\Enums\EnumRoles;
use App\Core\Users\Exceptions\UserAlreadyExistExceptions;
use App\Core\Users\Models\User;
use App\Core\Users\Repository\UserRepository;
use App\Core\Users\Services\PasswordHasherService;
use App\Core\Users\Services\PermissionDependencyService;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use App\Shared\Phone\Services\PhoneFormatterService;

class CreateAdminUseCase
{
    public function __construct(

        protected UserRepository $userRepo,

        protected IdGeneratorInterface $idGenerator,

        protected PasswordHasherService $passwordHasherService,

        protected PhoneFormatterService $phoneFormatterService,

        protected PermissionDependencyService $permissionDependencyService,

    ) {}

    public function execute(CreateAdminDto $dto, ?User $actor = null)
    {

        // When no actor is supplied (seeders, CLI, tests) the call is treated
        // as fully privileged. In HTTP flows the controller always passes the
        // authenticated user, so the delegation guards below apply. super_admin
        // is unrestricted (it already bypasses everything via Gate::before).
        $actorIsSuperAdmin = $actor === null
            || $actor->hasRole(EnumRoles::SUPER_ADMIN->value);

        // Defaults come straight from the request; a delegated (non-super)
        // admin gets them clamped below before anything is persisted.
        $permissions = $this->permissionDependencyService->normalize($dto->permissions ?? []);

        $municipalId = $dto->municipalId;

        if (! $actorIsSuperAdmin) {

            // Anti-escalation: a delegated admin can only grant permissions
            // they themselves already hold.
            $permissions = $this->permissionDependencyService->normalizeWithin(
                $permissions,
                $actor->getPermissionNames()->all(),
            );

            // Municipality lock: force the new admin into the actor's own
            // municipality, ignoring whatever municipal_id was submitted.
            $municipalId = $actor->municipal_id;

        }

        $adminId = $this->idGenerator->generate();

        $password = $this->passwordHasherService->hash($dto->password);

        $normalizePhone = $this->phoneFormatterService->normalize($dto->phone);

        $this->ensureUserDoesNotExist($normalizePhone, $dto->email);

        $admin = $this->userRepo->save([

            'id' => $adminId,

            'firstName' => $dto->firstName,

            'middleName' => $dto->middleName,

            'lastName' => $dto->lastName,

            'phone' => $normalizePhone,

            'password' => $password,

            'email' => $dto->email,

            'municipalId' => $municipalId,

        ]);

        // Role ceiling: this use case only ever assigns ADMIN, so a delegated
        // admin can never mint a super_admin.
        $admin->assignRole(EnumRoles::ADMIN->value);

        if (! empty($permissions)) {
            $admin->givePermissionTo($permissions);
        }

        return $admin;

    }

    private function ensureUserDoesNotExist(string $phone, ?string $email): void
    {
        if ($this->userRepo->findByPhone($phone) !== null) {

            throw UserAlreadyExistExceptions::withPhone($phone);
        }

        if ($email !== null && $this->userRepo->findByEmail($email)) {

            throw UserAlreadyExistExceptions::withEmail($email);
        }
    }
}
