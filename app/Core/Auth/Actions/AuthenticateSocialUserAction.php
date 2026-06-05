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
     *
     * @param  SocialUserDto  $dto
     * @param  string|null    $authenticatedUserId  Pass auth()->id() when called from the
     *                                               profile "Link Account" flow so the action
     *                                               attaches to the existing user instead of
     *                                               trying to match by email (which would fail
     *                                               for phone-only registrants whose email is null).
     */
    public function execute(SocialUserDto $dto, ?string $authenticatedUserId = null): User
    {
        return DB::transaction(function () use ($dto, $authenticatedUserId) {

            // 1. Already linked — returning social user (covers both login and re-link attempts)
            $socialAccount = UserSocialAccount::query()
                ->where('provider_name', $dto->providerName)
                ->where('provider_id', $dto->providerId)
                ->first();

            if ($socialAccount) {
                if ($dto->avatarUrl && $socialAccount->avatar_url !== $dto->avatarUrl) {
                    $socialAccount->update(['avatar_url' => $dto->avatarUrl]);
                }
                return $socialAccount->user;
            }

            // 2. Profile linking flow — authenticated user is connecting their Google account
            if ($authenticatedUserId) {
                $user = User::findOrFail($authenticatedUserId);

                // Write Google's pre-verified email back onto the user record
                $user->update([
                    'email'             => $dto->email,
                    'email_verified_at' => now(),
                ]);
            } else {
                // 3. Login/signup flow — try to match an existing account by email
                $user = User::query()->where('email', $dto->email)->first();

                if (!$user) {
                    // 4. First-time Google user — create a new account
                    $user = User::create([
                        'id'                => $this->idGenerator->generate(),
                        'email'             => $dto->email,
                        'first_name'        => $dto->firstName ?? 'User',
                        'last_name'         => $dto->lastName ?? 'Social',
                        'email_verified_at' => now(),
                        'password'          => Str::random(32),
                    ]);
                }
            }

            // 5. Create the social link (same for all paths)
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
