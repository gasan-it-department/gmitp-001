<?php

namespace App\External\Api\Controllers\Cemetery\Decedents;

use App\Core\Cemetery\Actions\Decedents\UploadDecedentAvatarAction;
use App\External\Api\Request\Cemetery\Decedents\UploadDecedentAvatarRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class UploadDecedentAvatarController extends Controller
{
    public function __construct(private UploadDecedentAvatarAction $uploadDecedentAvatar) {}

    public function __invoke(UploadDecedentAvatarRequest $request, string $decedentId): RedirectResponse
    {
        $this->uploadDecedentAvatar->execute($decedentId, app('municipal_id'), $request->file('avatar'));

        return back()->with('success', 'Profile photo updated.');
    }
}
