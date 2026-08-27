<?php

namespace App\Core\ActionCenter\Services;

use App\Core\ActionCenter\Contracts\AssistanceRequestFormDefinitionProvider;
use App\Core\ActionCenter\Dto\Assistance\AssistanceRequestFormDefinition;
use App\Core\ActionCenter\Dto\Assistance\AssistanceRequestFormFieldDefinition;
use Illuminate\Contracts\Config\Repository as ConfigRepository;
use InvalidArgumentException;

class ConfiguredAssistanceRequestFormDefinitionProvider implements AssistanceRequestFormDefinitionProvider
{
    private const SUPPORTED_FIELDS = [
        'on_behalf_date_of_death' => 'date',
    ];

    public function __construct(
        private readonly ConfigRepository $config,
    ) {}

    public function for(
        ?string $municipalCode,
        ?string $assistanceTypeSlug,
    ): AssistanceRequestFormDefinition {
        $defaults = $this->arrayValue(
            $this->config->get('action_center_assistance_request_forms.defaults', []),
        );
        $assistanceType = [];

        if ($municipalCode !== null && $assistanceTypeSlug !== null) {
            $assistanceType = $this->arrayValue($this->config->get(
                "action_center_assistance_request_forms.municipalities.{$municipalCode}.assistance_types.{$assistanceTypeSlug}",
                [],
            ));
        }

        $values = array_replace($defaults, $assistanceType);
        $filingMode = (string) ($values['filing_mode'] ?? 'self_or_on_behalf');
        $subjectType = (string) ($values['subject_type'] ?? 'person');

        if (! in_array($filingMode, ['self_or_on_behalf', 'on_behalf_only'], true)) {
            throw new InvalidArgumentException("Unsupported assistance request filing mode [{$filingMode}].");
        }

        if (! in_array($subjectType, ['person', 'deceased'], true)) {
            throw new InvalidArgumentException("Unsupported assistance request subject type [{$subjectType}].");
        }

        return new AssistanceRequestFormDefinition(
            filingMode: $filingMode,
            subjectType: $subjectType,
            fields: $this->fields($values['fields'] ?? []),
        );
    }

    /** @return list<AssistanceRequestFormFieldDefinition> */
    private function fields(mixed $configuredFields): array
    {
        if (! is_array($configuredFields)) {
            return [];
        }

        $fields = [];

        foreach ($configuredFields as $configuredField) {
            if (! is_array($configuredField)) {
                throw new InvalidArgumentException('Assistance request form fields must be arrays.');
            }

            $key = (string) ($configuredField['key'] ?? '');
            $type = (string) ($configuredField['type'] ?? '');

            if (! isset(self::SUPPORTED_FIELDS[$key]) || self::SUPPORTED_FIELDS[$key] !== $type) {
                throw new InvalidArgumentException("Unsupported assistance request form field [{$key}:{$type}].");
            }

            $fields[] = new AssistanceRequestFormFieldDefinition(
                key: $key,
                label: trim((string) ($configuredField['label'] ?? $key)),
                type: $type,
                required: (bool) ($configuredField['required'] ?? false),
                adminOnly: (bool) ($configuredField['admin_only'] ?? false),
            );
        }

        return $fields;
    }

    /** @return array<string, mixed> */
    private function arrayValue(mixed $value): array
    {
        return is_array($value) ? $value : [];
    }
}
