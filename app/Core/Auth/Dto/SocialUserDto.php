<?php

namespace App\Core\Auth\Dto;

readonly class SocialUserDto
{
    public function __construct(
        public string $providerName,
        public string $providerId,
        public ?string $email,
        public ?string $firstName = null,
        public ?string $lastName = null,
        public ?string $avatarUrl = null,
        public ?string $phone = null,
    ) {
    }

    /**
     * Factory to create from a Socialite user object.
     */
    public static function fromSocialite(string $provider, mixed $socialiteUser): self
    {
        // Socialite users often have 'name' which we split into first/last
        $parts = explode(' ', $socialiteUser->getName(), 2);
        
        return new self(
            providerName: $provider,
            providerId:   (string) $socialiteUser->getId(),
            email:        $socialiteUser->getEmail(),
            firstName:    $parts[0] ?? null,
            lastName:     $parts[1] ?? null,
            avatarUrl:    $socialiteUser->getAvatar(),
        );
    }
}
