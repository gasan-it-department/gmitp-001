<?php

namespace App\Core\SupportTicket\Dto;

readonly class ReplyToTicketDto
{
    public function __construct(
        public string  $municipalId,
        public string  $ticketId,
        public ?string $userId,
        public bool    $isStaff,
        public string  $body,
        /** @var array<int, \Illuminate\Http\UploadedFile> */
        public array   $attachments = [],
    ) {
    }
}
