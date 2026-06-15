<?php

namespace App\External\Api\Controllers\Cemetery\Decedents;

use App\Core\Cemetery\Models\DecedentCorrection;
use App\Http\Controllers\Controller;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DownloadDecedentCorrectionEvidenceController extends Controller
{
    public function __invoke(string $municipality, string $decedentId, string $correctionId): BinaryFileResponse
    {
        $correction = DecedentCorrection::query()
            ->where('municipal_id', app('municipal_id'))
            ->where('decedent_id', $decedentId)
            ->findOrFail($correctionId);
        $media = $correction->getFirstMedia('evidence');
        abort_unless($media, 404);

        return response()->download($media->getPath(), $media->file_name, [
            'Content-Type' => $media->mime_type,
            'Cache-Control' => 'private, no-store',
        ]);
    }
}
