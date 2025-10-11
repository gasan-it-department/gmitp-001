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

        $eloquentUser = EloquentUser::create([
            'id' => $user->id,
            'name' => $user->name,
            'user_name' => $user->user_name->getValue(),
            'phone' => $user->phone->getValue(),
            'password' => $this->passwordHasher->hash($user->password->getValue()),
            'role' => $user->role->getValue()
        ]);
        return $user->withId($eloquentUser->id);

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

    private function toDomainEntity(EloquentUser $eloquentUser): UserAggregate
    {

        return UserAggregate::create(
            id: $eloquentUser->id,
            name: $eloquentUser->name,
            phone: new Phone($eloquentUser->phone),
            user_name: new UserName($eloquentUser->user_name),
            password: new Password($eloquentUser->password),
            role: new Role(EnumRoles::from($eloquentUser->role)),
        );
    }
}