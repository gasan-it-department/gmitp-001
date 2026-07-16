<?php

namespace App\External\Api\Controllers\Cemetery\Interments;

use App\Core\Cemetery\Actions\Interments\VoidIntermentAction;
use App\Core\Cemetery\Dto\Interments\VoidIntermentDto;
use App\External\Api\Request\Cemetery\Interments\VoidIntermentRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class VoidIntermentController extends Controller
{
    public function __construct(
        private VoidIntermentAction $voidInterment,
    ) {}

    public function __invoke(VoidIntermentRequest $request, string $interment_id): RedirectResponse
    {
        $this->voidInterment->execute(
            VoidIntermentDto::fromRequest($interment_id, $request->validated())
        );

        return back()->with('success', 'Interment voided. Create the correct interment through the normal flow.');
    }
}
