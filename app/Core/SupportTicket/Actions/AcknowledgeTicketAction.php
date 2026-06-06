<?php

namespace App\Core\SupportTicket\Actions;

use App\Core\SupportTicket\Dto\AcknowledgeTicketDto;
use App\Core\SupportTicket\Enums\TicketStatus;
use App\Core\SupportTicket\Exceptions\InvalidStateTransitionException;
use App\Core\SupportTicket\Models\SupportTicket;
use Illuminate\Support\Facades\DB;

class AcknowledgeTicketAction
{
    public function execute(AcknowledgeTicketDto $dto): SupportTicket
    {
        return DB::transaction(function () use ($dto) {
            $ticket = SupportTicket::query()
                ->where('municipal_id', $dto->municipalId)
                ->whereKey($dto->ticketId)
                ->lockForUpdate()
                ->firstOrFail();

            $allowed = [TicketStatus::OPEN, TicketStatus::REOPENED];

            if (!in_array($ticket->status, $allowed)) {
                throw InvalidStateTransitionException::fromStatus(
                    $ticket->status->value,
                    TicketStatus::ACKNOWLEDGED->value
                );
            }

            $ticket->update([
                'status' => TicketStatus::ACKNOWLEDGED,
                'acknowledged_at' => now(),
                'acknowledged_by' => $dto->actorUserId,
            ]);

            return $ticket;
        }, attempts: 3);
    }
}
