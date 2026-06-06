<?php

namespace App\Core\SupportTicket\Actions;

use App\Core\SupportTicket\Dto\StartTicketProgressDto;
use App\Core\SupportTicket\Enums\TicketStatus;
use App\Core\SupportTicket\Exceptions\InvalidStateTransitionException;
use App\Core\SupportTicket\Models\SupportTicket;
use Illuminate\Support\Facades\DB;

class StartTicketProgressAction
{
    public function execute(StartTicketProgressDto $dto): SupportTicket
    {
        return DB::transaction(function () use ($dto) {
            $ticket = SupportTicket::query()
                ->where('municipal_id', $dto->municipalId)
                ->whereKey($dto->ticketId)
                ->lockForUpdate()
                ->firstOrFail();

            $allowed = [
                TicketStatus::OPEN,
                TicketStatus::ACKNOWLEDGED,
                TicketStatus::REOPENED,
            ];

            if (!in_array($ticket->status, $allowed)) {
                throw InvalidStateTransitionException::fromStatus(
                    $ticket->status->value,
                    TicketStatus::IN_PROGRESS->value
                );
            }

            $ticket->update([
                'status' => TicketStatus::IN_PROGRESS,
                'in_progress_at' => now(),
                'assigned_to' => $dto->assignedTo ?? $ticket->assigned_to,
            ]);

            return $ticket;
        }, attempts: 3);
    }
}
