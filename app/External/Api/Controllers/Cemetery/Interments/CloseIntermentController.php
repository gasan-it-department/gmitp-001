<?php

namespace App\External\Api\Controllers\Cemetery\Interments;

use App\Core\Cemetery\Actions\Interments\CloseIntermentAction;
use App\Core\Cemetery\Dto\Interments\CloseIntermentDto;
use App\External\Api\Request\Cemetery\Interments\CloseIntermentRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class CloseIntermentController extends Controller
{
    public function __construct(
        private CloseIntermentAction $closeInterment,
    ) {}

    public function __invoke(CloseIntermentRequest $request, string $interment_id): RedirectResponse
    {
        $this->closeInterment->execute(
            CloseIntermentDto::fromRequest($interment_id, $request->validated())
        );

        return redirect()->back()->with('success', 'Interment closed successfully.');
    }
}
