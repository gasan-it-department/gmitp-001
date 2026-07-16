<?php

namespace App\External\Api\Controllers\Cemetery\Decedents;

use App\Core\Cemetery\Models\DecedentDocument;
use App\Http\Controllers\Controller;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DownloadDecedentDocumentController extends Controller
{
    public function __invoke(string $municipality, string $decedentId, string $documentId): BinaryFileResponse
    {
        $document = DecedentDocument::query()
            ->where('municipal_id', app('municipal_id'))
            ->where('decedent_id', $decedentId)
            ->findOrFail($documentId);
        $media = $document->getFirstMedia('file');
        abort_unless($media, 404);

        return response()->download($media->getPath(), $media->file_name, [
            'Content-Type' => $media->mime_type,
            'Cache-Control' => 'private, no-store',
        ]);
    }
}
