<?php

namespace App\Core\Users\Repository;

use App\Core\Users\Dto\RegisterUserDto;
use App\Core\Users\Models\User;

class UserRepository
{
    public function save(array $data): User
    {
        return User::create([
            'id' => $data['id'],
            'first_name' => $data['firstName'],
            'middle_name' => $data['middleName'],
            'last_name' => $data['lastName'],
            'user_name' => $data['userName'],
            'phone' => $data['phone'],
            'password' => $data['password'],
        ]);
    }

    public function findByUserName(string $userName): ?User
    {
        return User::where('user_name', $userName)->first();
    }

    public function findByPhone($phone): ?User
    {
        return User::where('phone', $phone)->first();
    }

    public function getAll()
    {

        return User::with(['roles', 'permissions'])->get();
    }
}