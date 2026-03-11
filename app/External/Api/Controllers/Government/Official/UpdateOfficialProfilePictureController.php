<?php

namespace App\External\Api\Controllers\Government\Official;

use App\Core\Government\UseCase\UpdateOfficialProfilePictureUseCase;
use App\External\Api\Request\Government\OfficialProfilePictureRequest;
use App\Http\Controllers\Controller;

class UpdateOfficialProfilePictureController extends Controller
{

    public function __construct(
        private UpdateOfficialProfilePictureUseCase $updateOfficialProfilePictureUseCase
    ) {
    }

    public function __invoke(OfficialProfilePictureRequest $request, string $officialId)
    {
        $official = $this->updateOfficialProfilePictureUseCase->execute(app('municipal_id'), $officialId, $request->file('profile_picture'));

        return back()->with('success', 'Profile picture updated successfully.');

    }

}