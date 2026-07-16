<?php

namespace App\External\Api\Controllers\Cemetery\Decedents;

use App\Core\Cemetery\Models\Decedent;
use App\Http\Controllers\Controller;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DownloadDecedentCorrectionEvidenceController extends Controller
{
    public function __invoke(string $municipality, string $decedentId, string $mediaId): BinaryFileResponse
    {
        $decedent = Decedent::query()
            ->where('municipal_id', app('municipal_id'))
            ->findOrFail($decedentId);
        $media = $decedent->media()
            ->whereKey($mediaId)
            ->where('collection_name', 'correction_evidence')
            ->firstOrFail();

        return response()->download($media->getPath(), $media->file_name, [
            'Content-Type' => $media->mime_type,
            'Cache-Control' => 'private, no-store',
        ]);
    }
}
