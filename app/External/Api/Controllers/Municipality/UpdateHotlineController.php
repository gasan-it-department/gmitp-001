<?php

namespace App\External\Api\Controllers\Municipality;

use App\Core\Municipality\Actions\UpdateHotlineAction;
use App\Core\Municipality\Dto\UpdateHotlineDto;
use App\External\Api\Request\Municipality\UpdateHotlineRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class UpdateHotlineController extends Controller
{
    public function __construct(
        private UpdateHotlineAction $updateHotline,
    ) {
    }

    public function __invoke(UpdateHotlineRequest $request, string $hotline): RedirectResponse
    {
        $this->updateHotline->execute(
            $hotline,
            UpdateHotlineDto::fromRequest($request, app('municipal_id')),
        );

        return back()->with('success', 'Hotline updated.');
    }
}
