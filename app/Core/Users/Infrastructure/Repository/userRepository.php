<?php
namespace App\Core\Users\Infrastructure\Repository;
use App\Core\Users\Domains\Interfaces\UserRepositoryInterface;
use App\Core\Users\Infrastructure\Models\User as EloquentUser;
use App\Core\Users\Domains\Aggregates\UserAggregate;

class UserRepository implements UserRepositoryInterface
{
    public function save(UserAggregate $user): void
    {
        EloquentUser::create([
            'user_name' => $user->user_name->getValue(),
            'phone' => $user->phone->getValue(),
            'password' => $user->password->getValue(),
            'role' => $user->role->value()
        ])->save();
    }
}