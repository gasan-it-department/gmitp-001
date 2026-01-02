<?php

declare(strict_types=1);

namespace App\Core\Users\UseCases;

use App\Core\Users\Enums\EnumRoles;
use App\Core\Users\Dto\CreateAdminDto;
use App\Core\Users\Repository\UserRepository;
use App\Core\Users\Services\PasswordHasherService;
use App\Shared\Phone\Services\PhoneFormatterService;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;

class CreateAdminUseCase
{
    public function __construct(

        protected UserRepository $userRepo,

        protected IdGeneratorInterface $idGenerator,

        protected PasswordHasherService $passwordHasherService,

        protected PhoneFormatterService $phoneFormatterService,

    ) {
    }

    public function execute(CreateAdminDto $dto)
    {

        $adminId = $this->idGenerator->generate();

        $password = $this->passwordHasherService->hash($dto->password);

        $normalizePhone = $this->phoneFormatterService->normalize($dto->phone);

        $admin = $this->userRepo->save([

            'id' => $adminId,

            'firstName' => $dto->firstName,

            'middleName' => $dto->middleName,

            'lastName' => $dto->lastName,

            'userName' => $dto->userName,

            'phone' => $normalizePhone,

            'password' => $password,

            'email' => $dto->email,

            'municipalId' => $dto->municipalId,

        ]);

        $admin->assignRole(EnumRoles::ADMIN->value);

        if (!empty($dto->permissions)) {
            $admin->givePermissionTo($dto->permissions);
        }

        return $admin;

    }
}