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
            'socialAccounts',
        ]);

        if ($dto->group === 'administrators') {
            $query->role(['admin', 'super_admin']);
        } elseif ($dto->group === 'citizens') {
            $query->role('client')->whereDoesntHave('roles', fn (Builder $roles) => $roles->whereIn('name', ['admin', 'super_admin']));
        }

        $searchTerms = preg_split('/\s+/', trim((string) $dto->search), -1, PREG_SPLIT_NO_EMPTY);

        foreach ($searchTerms as $term) {
            $query->where(function (Builder $q) use ($term) {
                $pattern = '%'.str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $term).'%';

                $q->whereLike('first_name', $pattern)
                    ->orWhereLike('middle_name', $pattern)
                    ->orWhereLike('last_name', $pattern)
                    ->orWhereLike('email', $pattern)
                    ->orWhereLike('phone', $pattern);
            });
        }

        if ($dto->group !== 'citizens' && $dto->role && $dto->role !== 'all') {

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
