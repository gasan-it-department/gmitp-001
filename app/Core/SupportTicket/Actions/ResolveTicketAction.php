<?php

namespace App\Core\SupportTicket\Actions;

use App\Core\SupportTicket\Dto\ResolveTicketDto;
use App\Core\SupportTicket\Enums\TicketStatus;
use App\Core\SupportTicket\Exceptions\InvalidStateTransitionException;
use App\Core\SupportTicket\Models\SupportTicket;
use Illuminate\Support\Facades\DB;

class ResolveTicketAction
{
    public function execute(ResolveTicketDto $dto): SupportTicket
    {
        return DB::transaction(function () use ($dto) {
            $ticket = SupportTicket::query()
                ->where('municipal_id', $dto->municipalId)
                ->whereKey($dto->ticketId)
                ->lockForUpdate()
                ->firstOrFail();

            $allowed = [
                TicketStatus::ACKNOWLEDGED,
                TicketStatus::IN_PROGRESS,
                TicketStatus::REOPENED,
            ];

            if (!in_array($ticket->status, $allowed)) {
                throw InvalidStateTransitionException::fromStatus(
                    $ticket->status->value,
                    TicketStatus::RESOLVED->value
                );
            }

            $ticket->update([
                'status' => TicketStatus::RESOLVED,
                'resolved_at' => now(),
                'resolved_by' => $dto->actorUserId,
                'resolution_note' => $dto->resolutionNote,
            ]);

            return $ticket;
        }, attempts: 3);
    }
}
