<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Models\DocumentType;

class NormalizeAssistanceTypeDocumentSlotsAction
{
    /**
     * Keep recipient ID slots system-managed. Whenever a program includes a
     * filer ID side, both conditional recipient sides are attached as optional
     * slots so on-behalf forms can enforce them only when applicable.
     *
     * @param  array<int, array{id: string, is_required: bool}>  $documents
     * @return array<int, array{id: string, is_required: bool}>
     */
    public function execute(array $documents): array
    {
        if ($documents === []) {
            return [];
        }

        $documentTypes = DocumentType::query()
            ->whereIn('id', collect($documents)->pluck('id'))
            ->get(['id', 'key'])
            ->keyBy('id');

        $hasFilerIdSlot = collect($documents)->contains(function (array $document) use ($documentTypes) {
            return in_array(
                $documentTypes->get($document['id'])?->key,
                ['valid_id_front', 'valid_id_back'],
                true,
            );
        });

        $recipientTypes = DocumentType::query()
            ->whereIn('key', ['recipient_valid_id_front', 'recipient_valid_id_back'])
            ->get(['id', 'key']);
        $recipientIds = $recipientTypes->pluck('id');

        $normalized = collect($documents)
            ->reject(fn (array $document) => $recipientIds->contains($document['id']))
            ->values();

        if ($hasFilerIdSlot) {
            foreach ($recipientTypes as $recipientType) {
                $normalized->push([
                    'id' => $recipientType->id,
                    'is_required' => false,
                ]);
            }
        }

        return $normalized->all();
    }
}
