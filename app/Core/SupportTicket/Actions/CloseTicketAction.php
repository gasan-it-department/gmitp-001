<?php

namespace App\Core\SupportTicket\Actions;

use App\Core\SupportTicket\Dto\CloseTicketDto;
use App\Core\SupportTicket\Enums\TicketStatus;
use App\Core\SupportTicket\Exceptions\InvalidStateTransitionException;
use App\Core\SupportTicket\Models\SupportTicket;
use Illuminate\Support\Facades\DB;

class CloseTicketAction
{
    public function execute(CloseTicketDto $dto): SupportTicket
    {
        return DB::transaction(function () use ($dto) {
            $ticket = SupportTicket::query()
                ->where('municipal_id', $dto->municipalId)
                ->whereKey($dto->ticketId)
                ->lockForUpdate()
                ->firstOrFail();

            if ($ticket->status === TicketStatus::CLOSED) {
                throw InvalidStateTransitionException::fromStatus(
                    $ticket->status->value,
                    TicketStatus::CLOSED->value
                );
            }

            $ticket->update([
                'status' => TicketStatus::CLOSED,
                'closed_at' => now(),
                'closed_by' => $dto->actorUserId,
            ]);

            return $ticket;
        }, attempts: 3);
    }
}
