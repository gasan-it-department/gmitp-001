<?php

namespace App\Domains\Users\Repositories;

use App\Domains\Users\Interfaces\UserRepositoryInterface;
use App\Domains\Users\Dtos\UserDto;
use App\Domains\Users\Mappers\UserMapper;
use App\Domains\Users\Models\User;


class UserRepository implements UserRepositoryInterface
{
    //public function create(User $user): User;
    public function all()
    {
        return User::all();
    }

    public function find(int $id)
    {
        return User::find($id);
    }

    public function create(array $data)
    {

        return User::create($data);
    }

    public function update(int $id, array $data)
    {
        $user = User::find($id);
        if ($user) {
            $user->update($data);
            return $user;
        }
        return null;
    }

    public function delete(int $id)
    {
        $user = User::find($id);
        if ($user) {
            return $user->delete();
        }
        return false;
    }
}