<?php

namespace App\Core\Auth\Actions;

use App\Core\Auth\Dto\SupabaseUserDto;
use App\Core\Auth\Exceptions\InvalidSupabaseIdentityException;
use App\Core\Auth\Exceptions\SupabaseIdentityConflictException;
use App\Core\Auth\Exceptions\SupabaseProfileIncompleteException;
use App\Core\Auth\Models\UserSocialAccount;
use App\Core\Users\Enums\EnumRoles;
use App\Core\Users\Models\User;
use App\Core\Users\ValueObjects\Phone;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class AuthenticateSupabaseUserAction
{
    private const PROVIDER_NAME = 'supabase';

    public function __construct(
        private IdGeneratorInterface $idGenerator,
    ) {}

    public function execute(SupabaseUserDto $dto): User
    {
        $email = $this->normalizeEmail($dto->email);
        $phone = $this->verifiedPhone($dto);

        if ($email === null && $phone === null) {
            throw new InvalidSupabaseIdentityException(
                'The Supabase account must contain a valid email address or a verified phone number.',
            );
        }

        return DB::transaction(function () use ($dto, $email, $phone): User {
            $socialAccount = UserSocialAccount::query()
                ->where('provider_name', self::PROVIDER_NAME)
                ->where('provider_id', $dto->providerId)
                ->lockForUpdate()
                ->first();

            if ($socialAccount) {
                $user = User::query()
                    ->whereKey($socialAccount->user_id)
                    ->lockForUpdate()
                    ->firstOrFail();

                $this->ensureCitizenAccount($user);
                $this->synchronizeVerifiedIdentity($user, $email, $phone);

                if ($dto->avatarUrl && $socialAccount->avatar_url !== $dto->avatarUrl) {
                    $socialAccount->update(['avatar_url' => $dto->avatarUrl]);
                }

                return $user->refresh();
            }

            $phoneUser = $phone === null
                ? null
                : User::query()
                    ->where('phone', $phone)
                    ->lockForUpdate()
                    ->first();

            $emailUser = $email === null
                ? null
                : User::query()
                    ->whereRaw('LOWER(TRIM(email)) = ?', [$email])
                    ->lockForUpdate()
                    ->first();

            if ($phoneUser && $emailUser && ! $phoneUser->is($emailUser)) {
                throw new SupabaseIdentityConflictException(
                    'The verified phone and email belong to different Laravel accounts.',
                );
            }

            $user = $phoneUser ?? $emailUser;

            if ($user) {
                $this->ensureCitizenAccount($user);
                $this->ensureProviderIsAvailableFor($user, $dto->providerId);
                $this->synchronizeVerifiedIdentity($user, $email, $phone);
            } else {
                $user = $this->createCitizen($dto, $email, $phone);
            }

            UserSocialAccount::query()->create([
                'id' => $this->idGenerator->generate(),
                'user_id' => $user->id,
                'provider_name' => self::PROVIDER_NAME,
                'provider_id' => $dto->providerId,
                'avatar_url' => $dto->avatarUrl,
            ]);

            return $user->refresh();
        }, attempts: 3);
    }

    private function verifiedPhone(SupabaseUserDto $dto): ?string
    {
        if ($dto->phone === null || trim($dto->phone) === '') {
            return null;
        }

        if (! $dto->phoneConfirmed) {
            if ($dto->email !== null && trim($dto->email) !== '') {
                return null;
            }

            throw new InvalidSupabaseIdentityException(
                'The Supabase phone number has not been verified.',
            );
        }

        try {
            return (new Phone($dto->phone))->toString();
        } catch (InvalidArgumentException) {
            throw new InvalidSupabaseIdentityException(
                'The Supabase account contains an invalid Philippine phone number.',
            );
        }
    }

    private function normalizeEmail(?string $email): ?string
    {
        if ($email === null || trim($email) === '') {
            return null;
        }

        $normalized = mb_strtolower(trim($email));

        if (filter_var($normalized, FILTER_VALIDATE_EMAIL) === false) {
            throw new InvalidSupabaseIdentityException(
                'The Supabase account contains an invalid email address.',
            );
        }

        return $normalized;
    }

    private function ensureCitizenAccount(User $user): void
    {
        $roleNames = $user->roles()
            ->pluck('name');

        if (
            $user->municipal_id !== null
            || $roleNames->count() !== 1
            || $roleNames->first() !== EnumRoles::CLIENT->value
        ) {
            throw new SupabaseIdentityConflictException(
                'AGA authentication can only be connected automatically to a citizen account.',
            );
        }
    }

    private function ensureProviderIsAvailableFor(User $user, string $providerId): void
    {
        $existingLink = UserSocialAccount::query()
            ->where('user_id', $user->id)
            ->where('provider_name', self::PROVIDER_NAME)
            ->lockForUpdate()
            ->first();

        if ($existingLink && $existingLink->provider_id !== $providerId) {
            throw new SupabaseIdentityConflictException(
                'This Laravel account is already connected to a different Supabase identity.',
            );
        }
    }

    private function synchronizeVerifiedIdentity(User $user, ?string $email, ?string $phone): void
    {
        $updates = [];

        if ($phone !== null) {
            $phoneOwner = User::query()
                ->where('phone', $phone)
                ->whereKeyNot($user->id)
                ->lockForUpdate()
                ->first();

            if ($phoneOwner) {
                throw new SupabaseIdentityConflictException(
                    'The verified phone number is already connected to another Laravel account.',
                );
            }

            if ($user->phone !== $phone) {
                $updates['phone'] = $phone;
            }

            if ($user->phone_verified_at === null || $user->phone !== $phone) {
                $updates['phone_verified_at'] = now();
            }
        }

        if ($email !== null && $user->email === null) {
            $emailOwner = User::query()
                ->whereRaw('LOWER(TRIM(email)) = ?', [$email])
                ->whereKeyNot($user->id)
                ->lockForUpdate()
                ->first();

            if ($emailOwner) {
                throw new SupabaseIdentityConflictException(
                    'The email address is already connected to another Laravel account.',
                );
            }

            $updates['email'] = $email;
        }

        if ($updates !== []) {
            $user->update($updates);
        }
    }

    private function createCitizen(SupabaseUserDto $dto, ?string $email, ?string $phone): User
    {
        $firstName = trim((string) $dto->firstName);
        $lastName = trim((string) $dto->lastName);

        if ($phone !== null && ($firstName === '' || $lastName === '')) {
            throw new SupabaseProfileIncompleteException;
        }

        $user = User::query()->create([
            'id' => $this->idGenerator->generate(),
            'first_name' => $firstName !== '' ? $firstName : 'User',
            'last_name' => $lastName !== '' ? $lastName : 'Social',
            'email' => $email,
            'phone' => $phone,
            'phone_verified_at' => $phone !== null ? now() : null,
            'municipal_id' => null,
            'password' => null,
        ]);

        $user->assignRole(EnumRoles::CLIENT->value);

        return $user;
    }
}
