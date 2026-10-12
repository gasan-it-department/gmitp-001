<?php

namespace App\Core\GoodsDistribution\Enums;

enum DocumentEvidenceMode: string
{
    case Physical = 'physical';
    case Upload = 'upload';
    case Both = 'both';
}
