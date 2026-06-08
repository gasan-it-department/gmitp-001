<?php

namespace App\External\Documents\ActionCenter;

use App\Core\ActionCenter\UseCase\Beneficiary\UploadBeneficiaryAvatarAction;
use App\External\Api\Request\ActionCenter\Beneficiary\UploadBeneficiaryAvatarRequest;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

/**
 * Admin "upload / replace a beneficiary's profile photo" endpoint.
 *
 * Route: POST /api/action-center/beneficiary/{beneficiaryId}/avatar
 * (admin + permission:action_center.access; tenant via X-Municipality-Slug.)
 *
 * Thin controller — tenant guard + the single-file replace live in
 * UploadBeneficiaryAvatarAction. Returns a flash redirect so the Inertia page
 * reloads with the new photo.
 */
class UploadBeneficiaryAvatarController extends Controller
{
    public function __construct(
        private readonly UploadBeneficiaryAvatarAction $uploadAvatar,
    ) {
    }

    public function __invoke(
        string $beneficiaryId,
        UploadBeneficiaryAvatarRequest $request,
    ): RedirectResponse {
        try {
            $this->uploadAvatar->execute(
                beneficiaryId: $beneficiaryId,
                photo: $request->file('avatar'),
                municipalId: app('municipal_id'),
                actingAdminId: Auth::id(),
            );

            return back()->with('success', 'Profile photo updated.');
        } catch (AuthorizationException $e) {
            return back()->withErrors(['avatar' => $e->getMessage()]);
        }
    }
}
