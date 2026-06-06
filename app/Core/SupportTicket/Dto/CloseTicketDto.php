<?php

namespace App\Core\SupportTicket\Dto;

readonly class CloseTicketDto
{
    public function __construct(
        public string $municipalId,
        public string $ticketId,
        public string $actorUserId,
    ) {
    }
}
