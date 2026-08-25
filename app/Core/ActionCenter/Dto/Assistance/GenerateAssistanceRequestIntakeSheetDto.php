<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use App\External\Api\Request\ActionCenter\GenerateAssistanceRequestIntakeSheetRequest;

readonly class GenerateAssistanceRequestIntakeSheetDto
{
    /** @param list<string> $problemPresented */
    public function __construct(
        public string $assistanceRequestId,
        public string $municipalId,
        public array $problemPresented,
        public string $sourceOfIncome,
        public float $monthlyIncome,
        public string $recommendation,
    ) {}

    public static function fromRequest(
        GenerateAssistanceRequestIntakeSheetRequest $request,
        string $assistanceRequestId,
        string $municipalId,
    ): self {
        return new self(
            assistanceRequestId: $assistanceRequestId,
            municipalId: $municipalId,
            problemPresented: array_values($request->validated('problem_presented')),
            sourceOfIncome: (string) $request->validated('source_of_income'),
            monthlyIncome: (float) $request->validated('monthly_income'),
            recommendation: (string) $request->validated('recommendation'),
        );
    }
}
