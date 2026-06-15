<?php

namespace App\Core\Cemetery\Actions\Decedents;

use App\Core\Cemetery\Enums\DocumentVerificationStatus;
use App\Core\Cemetery\Models\Decedent;
use App\Core\Cemetery\Models\DecedentDocument;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StoreDecedentDocumentAction
{
    public function __construct(private IdGeneratorInterface $idGenerator) {}

    public function execute(string $decedentId, string $municipalId, array $data, UploadedFile $file): DecedentDocument
    {
        return DB::transaction(function () use ($decedentId, $municipalId, $data, $file) {
            Decedent::query()->where('municipal_id', $municipalId)->findOrFail($decedentId);
            $superseded = null;

            if (filled($data['supersedes_document_id'] ?? null)) {
                $superseded = DecedentDocument::query()
                    ->where('municipal_id', $municipalId)
                    ->where('decedent_id', $decedentId)
                    ->lockForUpdate()
                    ->findOrFail($data['supersedes_document_id']);

                if ($superseded->verification_status === DocumentVerificationStatus::SUPERSEDED) {
                    throw ValidationException::withMessages(['supersedes_document_id' => 'This document was already superseded.']);
                }

                if ($superseded->type->value !== $data['type']) {
                    throw ValidationException::withMessages(['type' => 'A replacement must use the same document type.']);
                }

                if (DecedentDocument::query()
                    ->where('municipal_id', $municipalId)
                    ->where('decedent_id', $decedentId)
                    ->where('supersedes_id', $superseded->id)
                    ->where('verification_status', DocumentVerificationStatus::PENDING->value)
                    ->exists()) {
                    throw ValidationException::withMessages(['supersedes_document_id' => 'This document already has a pending replacement.']);
                }
            }

            $document = DecedentDocument::create([
                'id' => $this->idGenerator->generate(),
                'municipal_id' => $municipalId,
                'decedent_id' => $decedentId,
                'supersedes_id' => $superseded?->id,
                'type' => $data['type'],
                'document_number' => filled($data['document_number'] ?? null) ? mb_strtoupper(trim($data['document_number'])) : null,
                'issued_at' => $data['issued_at'] ?? null,
                'notes' => filled($data['notes'] ?? null) ? trim($data['notes']) : null,
                'verification_status' => DocumentVerificationStatus::PENDING->value,
            ]);

            $document->addMedia($file)->usingFileName($file->getClientOriginalName())->toMediaCollection('file', 'local');

            return $document->fresh(['media', 'supersedes']);
        });
    }
}
