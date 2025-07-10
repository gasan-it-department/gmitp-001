<?php

namespace App\Domains\Users\Services;


use App\Domains\Users\Interfaces\UserRepositoryInterface;
use App\Domains\Users\Mappers\UserMapper;
use Illuminate\Support\Facades\Hash;

class UserService
{
   protected UserRepositoryInterface $userRepo;
   public function __construct(
      protected UserRepositoryInterface $userRepository
   ) {
   }

}
