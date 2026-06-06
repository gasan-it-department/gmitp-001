<?php

namespace App\Core\SupportTicket\Actions;

use App\Core\SupportTicket\Dto\ReopenTicketDto;
use App\Core\SupportTicket\Enums\TicketStatus;
use App\Core\SupportTicket\Exceptions\InvalidStateTransitionException;
use App\Core\SupportTicket\Models\SupportTicket;
use Illuminate\Support\Facades\DB;

class ReopenTicketAction
{
    public function execute(ReopenTicketDto $dto): SupportTicket
    {
        return DB::transaction(function () use ($dto) {
            $ticket = SupportTicket::query()
                ->where('municipal_id', $dto->municipalId)
                ->whereKey($dto->ticketId)
                ->lockForUpdate()
                ->firstOrFail();

            $allowed = [TicketStatus::RESOLVED, TicketStatus::CLOSED];

            if (!in_array($ticket->status, $allowed)) {
                throw InvalidStateTransitionException::fromStatus(
                    $ticket->status->value,
                    TicketStatus::REOPENED->value
                );
            }

            $ticket->update([
                'status' => TicketStatus::REOPENED,
                'reopened_at' => now(),
                'closed_at' => null,
                'closed_by' => null,
            ]);

            return $ticket;
        }, attempts: 3);
    }
}
