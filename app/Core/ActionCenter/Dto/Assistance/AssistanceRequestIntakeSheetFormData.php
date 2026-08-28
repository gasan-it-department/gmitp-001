<?php

namespace App\Core\ActionCenter\Dto\Assistance;

readonly class AssistanceRequestIntakeSheetFormData
{
    public function __construct(
        public string $assistanceRequestId,
        public string $transactionNumber,
        public string $claimantName,
        public ?int $ageAtFiling,
        public ?string $civilStatus,
        public ?string $barangay,
        public string $assistanceType,
        public string $filingSubject,
        /** @var array<int, array{value: string, label: string}> */
        public array $problemOptions,
        /** @var array{source_of_income: ?string, monthly_income: ?float} */
        public array $frozenEconomicValues,
        /** @var array{source_of_income: ?string, monthly_income: ?float} */
        public array $currentEconomicValues,
        /** @var array{source: 'interview_assessment'|'request_snapshot'|'current_household_fallback', captured_at: ?string, member_count: int, warning: ?string} */
        public array $householdComposition,
        /** @var array{problem_presented: list<string>, source_of_income: ?string, monthly_income: ?float, recommendation: string} */
        public array $recommendedDefaults,
    ) {
    }

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'assistance_request_id' => $this->assistanceRequestId,
            'transaction_number' => $this->transactionNumber,
            'claimant_name' => $this->claimantName,
            'age_at_filing' => $this->ageAtFiling,
            'civil_status' => $this->civilStatus,
            'barangay' => $this->barangay,
            'assistance_type' => $this->assistanceType,
            'filing_subject' => $this->filingSubject,
            'problem_options' => $this->problemOptions,
            'frozen_economic_values' => $this->frozenEconomicValues,
            'current_economic_values' => $this->currentEconomicValues,
            'household_composition' => $this->householdComposition,
            'recommended_defaults' => $this->recommendedDefaults,
        ];
    }
}
