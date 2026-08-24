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

    public function findByEmail(string $email): ?User
    {

        return User::where('email', $email)->first();

    }

    public function findByPhone($phone): ?User
    {
        return User::where('phone', $phone)->first();
    }

    public function getAll(UserQueryDto $dto)
    {
        $query = User::query()->with([
            'roles.permissions',
            'permissions',
            'municipality',
        ]);

        $searchTerms = preg_split('/\s+/', trim((string) $dto->search), -1, PREG_SPLIT_NO_EMPTY);

        foreach ($searchTerms as $term) {
            $query->where(function (Builder $q) use ($term) {
                $pattern = '%'.str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $term).'%';

                $q->where('first_name', 'ilike', $pattern)
                    ->orWhere('middle_name', 'ilike', $pattern)
                    ->orWhere('last_name', 'ilike', $pattern)
                    ->orWhere('email', 'ilike', $pattern)
                    ->orWhere('phone', 'ilike', $pattern);
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

        return $query
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate(20)
            ->withQueryString();
    }
}
