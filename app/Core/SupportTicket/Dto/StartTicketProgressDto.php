<?php

namespace App\Core\SupportTicket\Dto;

readonly class StartTicketProgressDto
{
    public function __construct(
        public string  $municipalId,
        public string  $ticketId,
        public string  $actorUserId,
        public ?string $assignedTo = null,
    ) {
    }
}
