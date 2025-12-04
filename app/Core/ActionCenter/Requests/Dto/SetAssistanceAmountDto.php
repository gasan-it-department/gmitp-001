<?php

namespace App\Core\ActionCenter\Requests\Dto;

class SetAssistanceAmountDto
{
    public function __construct(

        public readonly string $assistanceId,

        public readonly float $amount

    ) {
    }
}