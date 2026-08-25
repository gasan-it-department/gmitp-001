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
        public ?string $sourceOfIncome,
        public ?float $monthlyIncome,
        public string $recommendation,
    ) {}

    public static function fromRequest(
        GenerateAssistanceRequestIntakeSheetRequest $request,
        string $assistanceRequestId,
        string $municipalId,
    ): self {
        $sourceOfIncome = $request->validated('source_of_income');
        $monthlyIncome = $request->validated('monthly_income');

        return new self(
            assistanceRequestId: $assistanceRequestId,
            municipalId: $municipalId,
            problemPresented: array_values($request->validated('problem_presented')),
            sourceOfIncome: is_string($sourceOfIncome) && $sourceOfIncome !== ''
                ? $sourceOfIncome
                : null,
            monthlyIncome: $monthlyIncome === null ? null : (float) $monthlyIncome,
            recommendation: (string) $request->validated('recommendation'),
        );
    }
}
