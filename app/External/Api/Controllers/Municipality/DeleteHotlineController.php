<?php

namespace App\External\Api\Controllers\Municipality;

use App\Core\Municipality\Actions\DeleteHotlineAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class DeleteHotlineController extends Controller
{
    public function __construct(
        private DeleteHotlineAction $deleteHotline,
    ) {
    }

    public function __invoke(string $hotline): RedirectResponse
    {
        $this->deleteHotline->execute(app('municipal_id'), $hotline);

        return back()->with('success', 'Hotline deleted.');
    }
}
