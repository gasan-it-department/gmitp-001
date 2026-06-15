<?php

namespace App\Core\Cemetery\Enums;

enum CorrectionStatus: string
{
    case PENDING = 'pending';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
}
