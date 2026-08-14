<?php

namespace App\External\Web\Controllers\Procurement\Admin;

use App\Core\Procurement\Enums\ProcurementDocumentType;
use App\Core\Procurement\UseCases\GetProcurementUseCase;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;

class DownloadProcurementDocumentController extends Controller
{
    public function __construct(
        private GetProcurementUseCase $getProcurement,
    ) {}

    public function __invoke(string $municipality, string $procurementId, string $mediaId)
    {
        $procurement = $this->getProcurement->execute(
            $procurementId,
            app('municipal_id'),
        );

        $media = $procurement->media()
            ->whereKey($mediaId)
            ->firstOrFail();

        abort_unless(
            ProcurementDocumentType::tryFrom($media->collection_name) !== null,
            404,
        );

        $disk = Storage::disk($media->disk);
        $path = $media->getPathRelativeToRoot();

        abort_unless($disk->exists($path), 404);

        return $disk->download(
            $path,
            $media->file_name,
            [
                'Cache-Control' => 'private, no-store, max-age=0',
                'Content-Type' => 'application/pdf',
                'X-Content-Type-Options' => 'nosniff',
            ],
        );
    }
}
