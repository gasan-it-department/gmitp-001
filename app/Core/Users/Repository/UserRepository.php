<?php

namespace App\Core\Users\Repository;

use App\Core\Users\Dto\RegisterUserDto;
use App\Core\Users\Dto\UserQueryDto;
use App\Core\Users\Models\User;
use Illuminate\Database\Eloquent\Builder;
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
            'municipal_id' => $data['municipalId'] ?? null,
            'email' => $data['email'] ?? null,
        ]);
    }

    public function findById(string $userId)
    {

        return user::findOrFail($userId);

    }

    public function findByUserName(string $userName): ?User
    {
        return User::where('user_name', $userName)->first();
    }

    public function findByPhone($phone): ?User
    {
        return User::where('phone', $phone)->first();
    }

    public function getAll(UserQueryDto $dto)
    {

        $query = User::query();

        if ($dto->search) {
            $query->where(function (Builder $q) use ($dto) {
                $q->where('first_name', 'like', "%{$dto->search}%")
                    ->orWhere('last_name', 'like', "%{$dto->search}%")
                    ->orWhere('email', 'like', "%{$dto->search}%")
                    ->orWhere('user_name', 'like', "%{$dto->search}%");
            });
        }

        if ($dto->role && $dto->role !== 'all') {

            $query->role($dto->role);

        }

        if ($dto->municipality && $dto->municipality !== 'all') {
            // "Find users where the 'municipality' relationship has a name like 'gasan'"
            $query->whereHas('municipality', function (Builder $q) use ($dto) {
                $q->where('name', 'like', $dto->municipality); // or use 'slug' if your value is a slug
            });
        }

        return $query->paginate(10)->withQueryString();
    }
}