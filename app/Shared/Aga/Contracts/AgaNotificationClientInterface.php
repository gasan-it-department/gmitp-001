<?php

namespace App\Shared\Aga\Contracts;

use App\Shared\Aga\Dto\AgaNotificationDto;
use App\Shared\Aga\Dto\AgaNotificationResultDto;

interface AgaNotificationClientInterface
{
    public function send(AgaNotificationDto $notification): AgaNotificationResultDto;
}
