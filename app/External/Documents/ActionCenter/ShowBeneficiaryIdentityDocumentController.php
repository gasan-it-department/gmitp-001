<?php

namespace App\External\Documents\ActionCenter;

use App\Core\ActionCenter\Models\Beneficiary;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ShowBeneficiaryIdentityDocumentController extends Controller
{
    public function __invoke(
        string $municipality,
        string $beneficiaryId,
        string $side,
        Request $request,
    ): Response {
        $beneficiary = Beneficiary::query()
            ->with(['household:id,municipal_id', 'media'])
            ->whereKey($beneficiaryId)
            ->firstOrFail();

        if ($beneficiary->household?->municipal_id !== app('municipal_id')) {
            throw new AuthorizationException('This document is not available in your municipality.');
        }

        $collection = match ($side) {
            'front' => 'identity_id_front',
            'back' => 'identity_id_back',
            default => abort(404),
        };

        $media = $beneficiary->getFirstMedia($collection);

        if ($media === null) {
            abort(404);
        }

        return $media->toAvailableInlineResponse(
            $request,
            [Beneficiary::IDENTITY_DISPLAY_CONVERSION],
        );
    }
}
