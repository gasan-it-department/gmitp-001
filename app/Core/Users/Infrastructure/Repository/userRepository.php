<?php
namespace App\Core\Users\Infrastructure\Repository;
use App\Core\Users\Domains\Interfaces\UserRepositoryInterface;
use App\Core\Users\Infrastructure\Models\User as EloquentUser;
use App\Core\Users\Domains\Aggregates\UserAggregate;
use App\Core\Users\Domains\ValueObjects\{UserName, Phone, Password, Role};
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

    }

    public function findByPhone(string $phone): ?UserAggregate
    {

    }
    public function findByUserName(string $userName): ?UserAggregate
    {

    }
    public function findByUuid(string $uuid): ?UserAggregate
    {

    }

    private function toDomainEntity(EloquentUser $eloquentUser): UserAggregate
    {
        return UserAggregate::create(
            uuid: $eloquentUser->uuid,
            username: new Username($eloquentUser->username),
            phoneNumber: new Phone($eloquentUser->phone),
            password: new Password('dummy-password'), // We don't reconstruct actual password
            id: $eloquentUser->id
        );
    }
}