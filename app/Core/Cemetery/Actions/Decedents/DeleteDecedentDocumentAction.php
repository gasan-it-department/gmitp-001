<?php

namespace App\Core\Cemetery\Actions\Decedents;

use App\Core\Cemetery\Models\DecedentDocument;
use Illuminate\Support\Facades\DB;

class DeleteDecedentDocumentAction
{
    public function execute(string $documentId, string $decedentId, string $municipalId): void
    {
        DB::transaction(function () use ($documentId, $decedentId, $municipalId) {
            $document = DecedentDocument::query()
                ->where('municipal_id', $municipalId)
                ->where('decedent_id', $decedentId)
                ->lockForUpdate()
                ->findOrFail($documentId);

            activity('cemetery_decedent_document')
                ->performedOn($document)
                ->causedBy(auth()->user())
                ->event('deleted')
                ->withProperties([
                    'decedent_id' => $decedentId,
                    'type' => $document->type->value,
                    'document_number' => $document->document_number,
                ])
                ->log('Decedent document removed');

            $document->delete();
        });
    }
}
