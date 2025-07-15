<?php

namespace App\Domains\Users\Services;


use App\Domains\Users\Interfaces\UserRepositoryInterface;
use App\Domains\Users\Mappers\UserMapper;
use Illuminate\Support\Facades\Hash;

class UserService
{
   public function __construct(protected UserRepositoryInterface $userRepo)
   {
      $this->userRepo = $userRepo;
   }

   public function create(array $data)
   {
      return $this->userRepo->create($data);
   }

}
