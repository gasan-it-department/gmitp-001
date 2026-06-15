<?php

namespace App\External\Api\Controllers\Cemetery\Decedents;

use App\Core\Cemetery\Actions\Decedents\RequestDecedentCorrectionAction;
use App\External\Api\Request\Cemetery\Decedents\RequestCorrectionRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class RequestDecedentCorrectionController extends Controller
{
    public function __construct(private RequestDecedentCorrectionAction $requestCorrection) {}

    public function __invoke(RequestCorrectionRequest $request, string $decedentId): RedirectResponse
    {
        $data = $request->validated();
        $this->requestCorrection->execute(
            $decedentId,
            app('municipal_id'),
            $data['proposed_changes'],
            $data['reason'],
            $request->file('evidence'),
        );

        return back()->with('success', 'Correction request submitted.');
    }
}
