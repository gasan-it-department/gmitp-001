<?php

namespace App\Core\SupportTicket\Actions;

use App\Core\SupportTicket\Dto\ReplyToTicketDto;
use App\Core\SupportTicket\Models\SupportTicket;
use App\Core\SupportTicket\Models\SupportTicketReply;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class ReplyToMyTicketAction
{
    public function __construct(
        private IdGeneratorInterface $idGenerator,
    ) {
    }

    public function execute(ReplyToTicketDto $dto): SupportTicketReply
    {
        return DB::transaction(function () use ($dto) {
            $ticket = SupportTicket::query()
                ->where('municipal_id', $dto->municipalId)
                ->where('user_id', $dto->userId)
                ->whereKey($dto->ticketId)
                ->lockForUpdate()
                ->firstOrFail();

            $reply = SupportTicketReply::create([
                'id' => $this->idGenerator->generate(),
                'ticket_id' => $ticket->id,
                'user_id' => $dto->userId,
                'is_staff' => false,
                'body' => $dto->body,
            ]);

            foreach ($dto->attachments as $file) {
                if (!$file instanceof UploadedFile) {
                    continue;
                }

                $reply
                    ->addMedia($file)
                    ->usingFileName($file->getClientOriginalName())
                    ->toMediaCollection('support_ticket_reply_attachments');
            }

            return $reply->fresh(['user:id,first_name,last_name', 'media']);
        }, attempts: 3);
    }
}
