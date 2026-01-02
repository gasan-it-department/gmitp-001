<?php

namespace App\Core\ActionCenter\Beneficiaries\Dto;

use Illuminate\Http\Request;

class FlagBeneficiaryDto
{

    public function __construct(

        public string $beneficiaryId,

        public string $userId,

        public string $reason,

        public string $severity,

        public ?string $notes = null,

        public ?string $expiresAt = null,

    ) {
    }

    public static function fromRequest(Request $request, string $beneficiaryId)
    {

        return new self(
            $beneficiaryId,
            $request->user()->id,
            $request->input('reason'),
            $request->input('severity'),
            $request->input('notes'),
            $request->input('expires_at'),
        );

    }

}