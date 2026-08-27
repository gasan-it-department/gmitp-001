<?php

namespace App\Core\ActionCenter\Dto\Assistance;

readonly class AssistanceRequestFormDefinition
{
    /**
     * @param  list<AssistanceRequestFormFieldDefinition>  $fields
     */
    public function __construct(
        public string $filingMode,
        public string $subjectType,
        public array $fields,
    ) {}

    public function isOnBehalfOnly(): bool
    {
        return $this->filingMode === 'on_behalf_only';
    }

    public function isDeceasedRequest(): bool
    {
        return $this->subjectType === 'deceased';
    }

    public function requiresDateOfDeath(): bool
    {
        foreach ($this->fields as $field) {
            if ($field->key === 'on_behalf_date_of_death') {
                return $field->required;
            }
        }

        return false;
    }

    /**
     * @return array{
     *     filing_mode: string,
     *     subject_type: string,
     *     fields: list<array{key: string, label: string, type: string, required: bool, admin_only: bool}>
     * }
     */
    public function toArray(): array
    {
        return [
            'filing_mode' => $this->filingMode,
            'subject_type' => $this->subjectType,
            'fields' => array_map(
                static fn (AssistanceRequestFormFieldDefinition $field): array => $field->toArray(),
                $this->fields,
            ),
        ];
    }
}
