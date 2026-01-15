<?php

namespace App\Core\Users\UseCases;

use App\Core\Users\Repository\UserRepository;
use Illuminate\Validation\ValidationException;

class UpdatePhoneNumberUseCase
{

    public function __construct(

        protected UserRepository $userRepository

    ) {
    }

    public function execute(string $userId, string $phoneNumber)
    {

        $user = $this->userRepository->findById($userId);

        if ($user->phone === $phoneNumber) {
            return $user;
        }

        $owner = $this->userRepository->findByPhone($phoneNumber);

        if ($owner && $owner->id !== $userId) {
            throw ValidationException::withMessages([
                'phone' => 'This phone number is already associated with another account.'
            ]);
        }

        $user->phone = $phoneNumber;

        $user->phone_verified_at = null;

        $user->save();

        return $user;

    }

}