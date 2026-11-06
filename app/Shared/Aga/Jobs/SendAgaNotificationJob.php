<?php

namespace App\Shared\Aga\Jobs;

use App\Shared\Aga\Contracts\AgaNotificationClientInterface;
use App\Shared\Aga\Dto\AgaNotificationDto;
use App\Shared\Aga\Exceptions\AgaNotificationException;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendAgaNotificationJob implements ShouldQueue
{
    use Queueable;

    // The receiver has no documented idempotency key. Blind retries could duplicate a broadcast.
    public int $tries = 1;
    public int $timeout = 20;
    public bool $failOnTimeout = true;

    public function __construct(public AgaNotificationDto $notification)
    {
        $this->afterCommit();
    }

    public function handle(AgaNotificationClientInterface $client): void
    {
        $result = $client->send($this->notification);
        if (! $result->successful()) {
            throw new AgaNotificationException(
                'AGA notification delivery incomplete: '.$result->sent.' sent, '.$result->failed.' failed. Review before retrying.',
            );
        }
    }
}
