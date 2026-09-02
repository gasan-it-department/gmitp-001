<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Enums\AssistanceGeneratedDocument;
use Illuminate\Validation\ValidationException;

class NormalizeAssistanceGeneratedDocumentsAction
{
    /**
     * @param  array<int, AssistanceGeneratedDocument|string>  $documents
     * @return array<int, string>
     */
    public function execute(array $documents): array
    {
        $values = array_map(
            fn (AssistanceGeneratedDocument|string $document): string => $document instanceof AssistanceGeneratedDocument
                ? $document->value
                : $document,
            $documents,
        );

        if (count($values) !== count(array_unique($values))) {
            throw ValidationException::withMessages([
                'enabled_generated_documents' => 'Each generated document may only be selected once.',
            ]);
        }

        $invalid = array_diff($values, AssistanceGeneratedDocument::values());

        if ($invalid !== []) {
            throw ValidationException::withMessages([
                'enabled_generated_documents' => 'One or more selected generated documents are not supported.',
            ]);
        }

        return array_values(array_filter(
            AssistanceGeneratedDocument::values(),
            fn (string $value): bool => in_array($value, $values, true),
        ));
    }
}
