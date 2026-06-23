<?php

namespace App\Core\Cemetery\Actions\Decedents;

use App\Core\Cemetery\Models\Decedent;
use App\Core\Cemetery\Models\DecedentDocument;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class StoreDecedentDocumentAction
{
    public function __construct(private IdGeneratorInterface $idGenerator) {}

    public function execute(string $decedentId, string $municipalId, array $data, UploadedFile $file): DecedentDocument
    {
        return DB::transaction(function () use ($decedentId, $municipalId, $data, $file) {
            Decedent::query()->where('municipal_id', $municipalId)->findOrFail($decedentId);

            $document = DecedentDocument::create([
                'id' => $this->idGenerator->generate(),
                'municipal_id' => $municipalId,
                'decedent_id' => $decedentId,
                'type' => $data['type'],
                'document_number' => filled($data['document_number'] ?? null) ? mb_strtoupper(trim($data['document_number'])) : null,
                'issued_at' => $data['issued_at'] ?? null,
                'notes' => filled($data['notes'] ?? null) ? trim($data['notes']) : null,
            ]);

            $document->addMedia($file)->usingFileName($file->getClientOriginalName())->toMediaCollection('file', 'local');

            return $document->fresh('media');
        });
    }
}
