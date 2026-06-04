<?php

namespace App\Core\Auth\Actions;

use App\Core\Auth\Dto\SocialUserDto;
use App\Core\Auth\Models\UserSocialAccount;
use App\Core\Users\Models\User;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AuthenticateSocialUserAction
{
    public function __construct(
        private IdGeneratorInterface $idGenerator,
    ) {
    }

    /**
     * Finds or creates a local user based on social provider data.
     * Handles linking to existing emails and creating new profiles.
     */
    public function execute(SocialUserDto $dto): User
    {
        return DB::transaction(function () use ($dto) {
            // 1. Try to find by provider details (returning social user)
            $socialAccount = UserSocialAccount::query()
                ->where('provider_name', $dto->providerName)
                ->where('provider_id', $dto->providerId)
                ->first();

            if ($socialAccount) {
                // Update avatar if it changed
                if ($dto->avatarUrl && $socialAccount->avatar_url !== $dto->avatarUrl) {
                    $socialAccount->update(['avatar_url' => $dto->avatarUrl]);
                }
                return $socialAccount->user;
            }

            // 2. Try to find by email (linking an existing local user)
            $user = User::query()
                ->where('email', $dto->email)
                ->first();

            if (!$user) {
                // 3. Create a brand new user (first time visitor)
                $user = User::create([
                    'id'                => $this->idGenerator->generate(),
                    'email'             => $dto->email,
                    'first_name'        => $dto->firstName ?? 'User',
                    'last_name'         => $dto->lastName ?? 'Social',
                    'email_verified_at' => now(),
                    'password'          => Str::random(32), // Placeholder for nullable password field
                ]);
            }

            // 4. Create the social link
            UserSocialAccount::create([
                'id'            => $this->idGenerator->generate(),
                'user_id'       => $user->id,
                'provider_name' => $dto->providerName,
                'provider_id'   => $dto->providerId,
                'avatar_url'    => $dto->avatarUrl,
            ]);

            return $user;
        }, attempts: 3);
    }
}
