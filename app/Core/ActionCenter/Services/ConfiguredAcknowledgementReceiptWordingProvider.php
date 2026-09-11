<?php

namespace App\Core\ActionCenter\Services;

use App\Core\ActionCenter\Contracts\AcknowledgementReceiptWordingProvider;
use App\Core\ActionCenter\Dto\Assistance\AcknowledgementReceiptWording;
use Illuminate\Contracts\Config\Repository as ConfigRepository;

class ConfiguredAcknowledgementReceiptWordingProvider implements AcknowledgementReceiptWordingProvider
{
    public function __construct(
        private readonly ConfigRepository $config,
    ) {}

    public function for(
        ?string $municipalCode,
        ?string $assistanceTypeSlug,
    ): AcknowledgementReceiptWording {
        $defaults = $this->arrayValue(
            $this->config->get('action_center_acknowledgement_receipts.defaults', []),
        );
        $municipality = $municipalCode === null
            ? []
            : $this->arrayValue($this->config->get(
                "action_center_acknowledgement_receipts.municipalities.{$municipalCode}",
                [],
            ));
        $assistanceTypes = $this->arrayValue($municipality['assistance_types'] ?? []);

        unset($municipality['assistance_types']);

        $assistanceType = $assistanceTypeSlug === null
            ? []
            : $this->arrayValue($assistanceTypes[$assistanceTypeSlug] ?? []);
        $values = array_replace($defaults, $municipality, $assistanceType);

        return new AcknowledgementReceiptWording(
            assistanceLabel: $this->nullableStringValue($values, 'assistance_label'),
            programName: $this->stringValue($values, 'program_name'),
            programQualifier: $this->nullableStringValue($values, 'program_qualifier'),
            programAcronym: $this->nullableStringValue($values, 'program_acronym'),
        );
    }

    /** @return array<string, mixed> */
    private function arrayValue(mixed $value): array
    {
        return is_array($value) ? $value : [];
    }

    /** @param array<string, mixed> $values */
    private function stringValue(array $values, string $key): string
    {
        return $this->nullableStringValue($values, $key) ?? '';
    }

    /** @param array<string, mixed> $values */
    private function nullableStringValue(array $values, string $key): ?string
    {
        $value = $values[$key] ?? null;

        if (! is_string($value)) {
            return null;
        }

        $value = trim($value);

        return $value !== '' ? $value : null;
    }
}
