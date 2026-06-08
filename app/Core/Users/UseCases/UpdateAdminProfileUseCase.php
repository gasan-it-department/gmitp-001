<?php

declare(strict_types=1);

namespace App\Core\Users\UseCases;

use App\Core\Users\Models\User;
use App\Core\Users\Enums\EnumRoles;
use App\Core\Users\Dto\UpdateAdminProfileDto;
use App\Core\Users\Services\PasswordHasherService;
use App\Shared\Phone\Services\PhoneFormatterService;

class UpdateAdminProfileUseCase
{
    public function __construct(

        protected PasswordHasherService $passwordHasherService,

        protected PhoneFormatterService $phoneFormatterService,

    ) {
    }

    public function execute(UpdateAdminProfileDto $dto, ?User $actor = null): User
    {

        // Direct model access (no repository) per design.
        $admin = User::findOrFail($dto->id);

        // super_admin is unrestricted (also bypasses via Gate::before). A
        // delegated (non-super) admin gets the same guards as creation.
        $actorIsSuperAdmin = $actor === null
            || $actor->hasRole(EnumRoles::SUPER_ADMIN->value);

        $permissions = $dto->permissions ?? [];

        $municipalId = $dto->municipalId;

        if (! $actorIsSuperAdmin) {

            // Anti-escalation: only grant permissions the actor already holds.
            $permissions = array_values(
                array_intersect($permissions, $actor->getPermissionNames()->all())
            );

            // Municipality lock: keep the admin within the actor's municipality.
            $municipalId = $actor->municipal_id;

        }

        $admin->first_name = $dto->firstName;

        $admin->middle_name = $dto->middleName;

        $admin->last_name = $dto->lastName;

        $admin->phone = $this->phoneFormatterService->normalize($dto->phone);

        $admin->email = $dto->email;

        $admin->municipal_id = $municipalId;

        // Only change the password when a new one was supplied.
        if (! empty($dto->password)) {
            $admin->password = $this->passwordHasherService->hash($dto->password);
        }

        $admin->save();

        // syncPermissions replaces the admin's direct permissions with the new
        // selection — handles both grants and revokes in a single call.
        $admin->syncPermissions($permissions);

        return $admin;

    }
}
