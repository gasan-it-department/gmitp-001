<?php

namespace App\Core\Cemetery\Actions\Decedents;

use App\Core\Cemetery\Enums\DocumentVerificationStatus;
use App\Core\Cemetery\Models\Decedent;
use App\Core\Cemetery\Models\DecedentDocument;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Http\UploadedFile;

trait StoresDecedentDocuments
{
    private function storeDocuments(Decedent $decedent, array $documents, IdGeneratorInterface $idGenerator): void
    {
        foreach ($documents as $payload) {
            $file = $payload['file'] ?? null;
            if (! $file instanceof UploadedFile) {
                continue;
            }

            $document = DecedentDocument::create([
                'id' => $idGenerator->generate(),
                'municipal_id' => $decedent->municipal_id,
                'decedent_id' => $decedent->id,
                'type' => $payload['type'],
                'document_number' => $this->upperOrNull($payload['document_number'] ?? null),
                'issued_at' => $payload['issued_at'] ?? null,
                'notes' => $this->cleanOrNull($payload['notes'] ?? null),
                'verification_status' => DocumentVerificationStatus::PENDING->value,
            ]);

            $document->addMedia($file)
                ->usingFileName($file->getClientOriginalName())
                ->toMediaCollection('file', 'local');
        }
    }

    private function upperOrNull(?string $value): ?string
    {
        $clean = $this->cleanOrNull($value);

        return $clean === null ? null : mb_strtoupper($clean);
    }

    private function cleanOrNull(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }
}
