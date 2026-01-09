<?php

namespace App\Core\ActionCenter\Requests\Dto;

use Illuminate\Http\Request;

class CreateAssistanceDto
{


    public function __construct(
        public readonly string $assistanceType,
        public readonly string $description,
        public readonly string $userId,
        public string $beneficiaryId,
        public ?array $files = null,
    ) {
    }
    public static function fromRequest(Request $request, string $beneficiaryId): self
    {
        $data = method_exists($request, 'validated') ? $request->validated() : $request->all();

        // $data = $request->validated();

        return new self(
            assistanceType: $data['assistance_type'],
            description: $data['description'],
            userId: $request->user()->id,
            beneficiaryId: $beneficiaryId,
            files: $request->file('documents')
        );
    }
}