<?php

namespace App\Core\SupportTicket\Actions;

use App\Core\SupportTicket\Dto\SubmitTicketDto;
use App\Core\SupportTicket\Enums\TicketStatus;
use App\Core\SupportTicket\Exceptions\TicketLimitExceededException;
use App\Core\SupportTicket\Models\SupportTicket;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SubmitTicketAction
{
    public function __construct(
        private IdGeneratorInterface $idGenerator,
        private CheckEligibilityToSubmitTicketAction $checkEligibility,
    ) {
    }

    public function execute(SubmitTicketDto $dto): SupportTicket
    {
        if (!$this->checkEligibility->execute($dto->userId, $dto->municipalId)) {
            throw TicketLimitExceededException::forDailyLimit(5);
        }

        return DB::transaction(function () use ($dto) {
            $ticket = SupportTicket::create([
                'id' => $this->idGenerator->generate(),
                'municipal_id' => $dto->municipalId,
                'user_id' => $dto->userId,
                'reference_no' => $this->generateReferenceNo(),
                'audience' => $dto->audience,
                'category' => $dto->category,
                'priority' => $dto->priority,
                'status' => TicketStatus::OPEN,
                'subject' => $dto->subject,
                'description' => $dto->description,
                'contact_name' => $dto->contactName,
                'contact_email' => $dto->contactEmail,
                'contact_number' => $dto->contactNumber,
                'page_url' => $dto->pageUrl,
                'app_version' => $dto->appVersion,
                'environment' => $dto->environment,
            ]);

            foreach ($dto->attachments as $file) {
                if (!$file instanceof UploadedFile) {
                    continue;
                }

                $ticket
                    ->addMedia($file)
                    ->usingFileName($file->getClientOriginalName())
                    ->toMediaCollection('support_ticket_attachments');
            }

            return $ticket->fresh(['media']);
        }, attempts: 3);
    }

    private function generateReferenceNo(): string
    {
        return 'TKT-' . now()->format('Y') . '-' . strtoupper(Str::random(6));
    }
}
