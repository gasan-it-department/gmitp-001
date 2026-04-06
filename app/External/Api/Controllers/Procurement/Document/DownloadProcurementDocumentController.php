<?php

namespace App\External\Api\Controllers\Procurement\Document;

use App\Core\Procurement\Models\ProcurementDocument;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DownloadProcurementDocumentController
{
    public function __invoke(string $documentId): StreamedResponse
    {
        $document = ProcurementDocument::findOrFail($documentId);

        // Optional: Add authorization here if needed
        // Gate::authorize('download', $document);

        // Assuming your database table has a 'storage_path' column indicating exactly where it lives on the disk
        $disk = 's3'; // Change to 's3' or 'r2' if you are using cloud storage

        if (!Storage::disk($disk)->exists($document->file_path)) {
            abort(404, 'File not found on the server.');
        }

        return Storage::disk($disk)->download(
            $document->file_path,
            $document->file_name
        );
    }
}