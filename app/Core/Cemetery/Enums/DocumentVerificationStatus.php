<?php

namespace App\Core\Cemetery\Enums;

enum DocumentVerificationStatus: string
{
    case PENDING = 'pending';
    case VERIFIED = 'verified';
    case REJECTED = 'rejected';
    case SUPERSEDED = 'superseded';
}
