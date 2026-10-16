<?php

namespace App\External\Web\Controllers\GoodsDistribution;

use App\Core\GoodsDistribution\Services\BulkDispatchService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

final class DownloadBulkDispatchEvidenceController extends Controller
{
    public function __invoke(Request $request, BulkDispatchService $bulk, string $municipality, string $dispatchId, string $mediaId): mixed
    {
        $bulk->actor(app('municipal_id'), $request->user()->id, 'view');
        $dispatch = $bulk->record(app('municipal_id'), $dispatchId);
        $media = $dispatch->media()->where('collection_name', 'bulk_dispatch_evidence')->whereKey($mediaId)->firstOrFail();

        return Storage::disk($media->disk)->download($media->getPathRelativeToRoot(), $media->name.'.'.pathinfo($media->file_name, PATHINFO_EXTENSION),
            ['Cache-Control' => 'private, no-store', 'X-Content-Type-Options' => 'nosniff']);
    }
}
