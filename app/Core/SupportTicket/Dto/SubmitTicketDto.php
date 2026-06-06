<?php

namespace App\Core\SupportTicket\Dto;

use App\Core\SupportTicket\Enums\TicketAudience;
use App\Core\SupportTicket\Enums\TicketCategory;
use App\Core\SupportTicket\Enums\TicketPriority;
use App\External\Api\Request\SupportTicket\SubmitTicketRequest;

readonly class SubmitTicketDto
{
    public function __construct(
        public string          $municipalId,
        public ?string         $userId,
        public TicketAudience  $audience,
        public TicketCategory  $category,
        public TicketPriority  $priority,
        public string          $subject,
        public string          $description,
        public ?string         $contactName = null,
        public ?string         $contactEmail = null,
        public ?string         $contactNumber = null,
        public ?string         $pageUrl = null,
        public ?string         $appVersion = null,
        public ?array          $environment = null,
        /** @var array<int, \Illuminate\Http\UploadedFile> */
        public array           $attachments = [],
    ) {
    }

    public static function fromRequest(
        SubmitTicketRequest $request,
        string $municipalId,
        TicketAudience $audience,
    ): self {
        return new self(
            municipalId:   $municipalId,
            userId:        $request->user()?->id,
            audience:      $audience,
            category:      TicketCategory::from(strtolower($request->string('category')->toString())),
            priority:      $request->filled('priority')
                ? TicketPriority::from(strtolower($request->string('priority')->toString()))
                : TicketPriority::NORMAL,
            subject:       $request->string('subject')->toString(),
            description:   $request->string('description')->toString(),
            contactName:   $request->filled('contact_name') ? $request->string('contact_name')->toString() : null,
            contactEmail:  $request->filled('contact_email') ? $request->string('contact_email')->toString() : null,
            contactNumber: $request->filled('contact_number') ? $request->string('contact_number')->toString() : null,
            pageUrl:       $request->filled('page_url') ? $request->string('page_url')->toString() : null,
            appVersion:    $request->filled('app_version') ? $request->string('app_version')->toString() : null,
            environment:   $request->input('environment'),
            attachments:   $request->file('attachments', []) ?? [],
        );
    }
}
