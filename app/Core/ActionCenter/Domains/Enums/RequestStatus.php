<?php

namespace App\Core\ActionCenter\Domains\Enums;

enum RequestStatus
{
    case PENDING = 'pending';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';

    public function statusLabel(): string
    {
        return match ($this) {
            RequestStatus::PENDING => 'Pending',
            RequestStatus::APPROVED => 'Approved',
            RequestStatus::REJECTED => 'Rejected',
            RequestStatus::COMPLETED => 'Completed',
            RequestStatus::CANCELLED => 'Cancelled',
        };
    }
}
