<?php
namespace App\Core\Users\Infrastructure\Repository;
use App\Core\Users\Domains\Interfaces\UserRepositoryInterface;
use App\Core\Users\Infrastructure\Models\User as EloquentUser;
use App\Core\Users\Domains\Aggregates\UserAggregate;
use App\Core\Users\Domains\ValueObjects\{UserName, Phone, Password, Uuid, Role};
use App\Core\Users\Domains\Enum\EnumRoles;
use App\Core\Users\Application\Interfaces\PasswordHasherInterface as PasswordHasher;

class UserRepository implements UserRepositoryInterface
{
    public function __construct(
        private PasswordHasher $passwordHasher
    ) {

    }
    public function save(UserAggregate $user): UserAggregate
    {
        if ($user->getId() === null) {
            $eloquentUser = EloquentUser::create([
                'uuid' => $user->uuid->toString(),
                'user_name' => $user->user_name->getValue(),
                'phone' => $user->phone->getValue(),
                'password' => $this->passwordHasher->hash($user->password->getValue()),
                'role' => $user->role->getValue()
            ]);

            return $user->withId($eloquentUser->id);
        }
        $eloquentUser = EloquentUser::findOrFail($user->getId());
        $eloquentUser->update([
            'uuid' => $user->uuid->toString(),
            'user_name' => $user->user_name->getValue(),
            'phone' => $user->phone->getValue(),
            'password' => $this->passwordHasher->hash($user->password->getValue()),
            'role' => $user->role->getValue()
        ]);
        return $user;
    }

    public function findById(string $id): ?UserAggregate
    {
        $eloquentUser = EloquentUser::where('id', $id)->first();

        return $eloquentUser ? $this->toDomainEntity($eloquentUser) : null;
    }

    public function findByPhone(string $phone): ?UserAggregate
    {
        $eloquentUser = EloquentUser::where('phone', $phone)->first();
        return $eloquentUser ? $this->toDomainEntity($eloquentUser) : null;
    }
    public function findByUserName(string $user_name): ?UserAggregate
    {
        $eloquentUser = EloquentUser::where('user_name', $user_name)->first();
        return $eloquentUser ? $this->toDomainEntity($eloquentUser) : null;
    }
    public function findByUuid(string $uuid): ?UserAggregate
    {
        $eloquentUser = EloquentUser::where('uuid', $uuid)->first();
        return $eloquentUser ? $this->toDomainEntity($eloquentUser) : null;
    }

    private function toDomainEntity(EloquentUser $eloquentUser): UserAggregate
    {

        return UserAggregate::create(
            new Uuid($eloquentUser->uuid),
            new Phone($eloquentUser->phone),
            new UserName($eloquentUser->user_name),
            new Password('dummy-password'), // We don't reconstruct actual password
            new Role(EnumRoles::from($eloquentUser->role)),
        );
    }
}