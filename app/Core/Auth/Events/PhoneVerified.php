<?php

namespace App\Core\Auth\Events;

use Illuminate\Queue\SerializesModels;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;

class PhoneVerified
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     * We only need the User ID so the listener knows which user to update.
     */
    public function __construct(
        public readonly string $userId
    ) {
    }

}