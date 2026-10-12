<?php

namespace App\External\Web\Controllers\GoodsDistribution;

use App\Core\GoodsDistribution\Actions\ReadDistributionRequestsAction;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;

final class DownloadDistributionDocumentController extends Controller
{
    public function __invoke(ReadDistributionRequestsAction $read, string $municipality, string $requestId, string $checkId): mixed
    {
        $media = $read->document(app('municipal_id'), $requestId, $checkId);

        return Storage::disk($media->disk)->download($media->getPathRelativeToRoot(), $media->file_name,
            ['Cache-Control' => 'private, no-store', 'X-Content-Type-Options' => 'nosniff']);
    }
}
