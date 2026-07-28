<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Enums\PhysicalCopyRequirement;
use App\Core\ActionCenter\Models\DocumentType;
use Illuminate\Validation\ValidationException;

class NormalizeAssistanceTypeDocumentSlotsAction
{
    /**
     * Keep recipient ID slots system-managed. Whenever a program includes a
     * filer ID side, both conditional recipient sides are attached as optional
     * slots so on-behalf forms can enforce them only when applicable.
     *
     * @param  array<int, array{id: string, is_required: bool, physical_copy_requirement?: string}>  $documents
     * @return array<int, array{id: string, is_required: bool, physical_copy_requirement: string}>
     */
    public function execute(array $documents, string $municipalId): array
    {
        if ($documents === []) {
            return [];
        }

        $documents = collect($documents)
            ->map(fn (array $document) => [
                ...$document,
                'physical_copy_requirement' => $this->normalizePhysicalCopyRequirement(
                    $document['physical_copy_requirement'] ?? null,
                ),
            ])
            ->values()
            ->all();

        $documentTypeIds = collect($documents)
            ->pluck('id')
            ->filter()
            ->unique()
            ->values();

        $documentTypes = DocumentType::query()
            ->availableToMunicipality($municipalId)
            ->whereIn('id', $documentTypeIds)
            ->get(['id', 'key'])
            ->keyBy('id');

        if ($documentTypes->count() !== $documentTypeIds->count()) {
            throw ValidationException::withMessages([
                'documents' => 'One or more selected document types are not available to this municipality.',
            ]);
        }

        $hasFilerIdSlot = collect($documents)->contains(function (array $document) use ($documentTypes) {
            return in_array(
                $documentTypes->get($document['id'])?->key,
                ['valid_id_front', 'valid_id_back'],
                true,
            );
        });

        $recipientTypes = DocumentType::query()
            ->availableToMunicipality($municipalId)
            ->whereIn('key', ['recipient_valid_id_front', 'recipient_valid_id_back'])
            ->get(['id', 'key']);
        $recipientIds = $recipientTypes->pluck('id');

        $normalized = collect($documents)
            ->reject(fn (array $document) => $recipientIds->contains($document['id']))
            ->values();

        if ($hasFilerIdSlot) {
            foreach ($recipientTypes as $recipientType) {
                $filerKey = str_replace('recipient_', '', $recipientType->key);
                $filerDocument = collect($documents)->first(
                    fn (array $document) => $documentTypes->get($document['id'])?->key === $filerKey,
                );

                $normalized->push([
                    'id' => $recipientType->id,
                    'is_required' => false,
                    'physical_copy_requirement' => $filerDocument['physical_copy_requirement']
                        ?? PhysicalCopyRequirement::Unspecified->value,
                ]);
            }
        }

        return $normalized->all();
    }

    private function normalizePhysicalCopyRequirement(mixed $value): string
    {
        return PhysicalCopyRequirement::tryFrom((string) $value)?->value
            ?? PhysicalCopyRequirement::Unspecified->value;
    }
}
