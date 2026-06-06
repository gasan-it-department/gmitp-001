<?php

namespace App\External\Api\Controllers\Procurement\Media;

use App\Core\Procurement\UseCases\Media\DeleteProcurementMediaUseCase;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class DeleteProcurementMediaController extends Controller
{
    public function __construct(
        private DeleteProcurementMediaUseCase $deleteMediaUseCase
    ) {
    }

    public function __invoke(string $procurementId, string $mediaId)
    {
        $this->deleteMediaUseCase->execute(
            $procurementId,
            app('municipal_id'),
            $mediaId
        );

        return back()->with('document deleted successfully.');
    }
}
