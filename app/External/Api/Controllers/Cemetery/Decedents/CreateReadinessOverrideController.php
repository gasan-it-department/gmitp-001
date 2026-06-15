<?php

namespace App\External\Api\Controllers\Cemetery\Decedents;

use App\Core\Cemetery\Actions\Decedents\CreateReadinessOverrideAction;
use App\External\Api\Request\Cemetery\Decedents\CreateReadinessOverrideRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class CreateReadinessOverrideController extends Controller
{
    public function __construct(private CreateReadinessOverrideAction $createOverride) {}

    public function __invoke(CreateReadinessOverrideRequest $request, string $decedentId): RedirectResponse
    {
        $data = $request->validated();
        $this->createOverride->execute($decedentId, app('municipal_id'), $data['reason'], $data['evidence_reference']);

        return back()->with('success', 'Seven-day readiness override created.');
    }
}
