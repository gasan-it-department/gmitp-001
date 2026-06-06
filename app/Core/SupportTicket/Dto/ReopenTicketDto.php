<?php

namespace App\Core\SupportTicket\Dto;

readonly class ReopenTicketDto
{
    public function __construct(
        public string  $municipalId,
        public string  $ticketId,
        public ?string $actorUserId,
    ) {
    }
}
