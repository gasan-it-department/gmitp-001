<?php

namespace App\External\Documents\ActionCenter;

use App\Core\ActionCenter\Models\Beneficiary;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Stream a beneficiary's profile photo — the source for the <img> on the
 * profile page, the edit form, and the search result cards.
 *
 * Route: GET /{municipality}/action-center/admin/beneficiary/{beneficiaryId}/avatar
 * (admin + permission:action_center.access — staff only.)
 *
 * The avatar lives on a PRIVATE disk (it's citizen PII), so there is no public
 * URL; every read goes through this authenticated, tenant-guarded controller.
 * Streamed INLINE so the browser renders it directly in the <img> tag.
 */
class ShowBeneficiaryAvatarController extends Controller
{
    public function __invoke(
        string $municipality,
        string $beneficiaryId,
        Request $request,
    ): Response {
        $beneficiary = Beneficiary::query()
            ->with(['household:id,municipal_id', 'media'])
            ->whereKey($beneficiaryId)
            ->firstOrFail();

        if ($beneficiary->household?->municipal_id !== app('municipal_id')) {
            throw new AuthorizationException('This photo is not available in your municipality.');
        }

        $media = $beneficiary->getFirstMedia('avatar');

        if ($media === null) {
            abort(404);
        }

        return $media->toInlineResponse($request);
    }
}
