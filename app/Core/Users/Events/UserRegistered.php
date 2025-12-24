<?php

namespace App\Core\Users\Events;

use App\Core\Users\Models\User;
use Illuminate\Queue\SerializesModels;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;

class UserRegistered
{

    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(

        public User $user

    ) {
    }

}