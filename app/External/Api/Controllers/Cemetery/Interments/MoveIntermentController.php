<?php

namespace App\External\Api\Controllers\Cemetery\Interments;

use App\Core\Cemetery\Actions\Interments\MoveIntermentAction;
use App\Core\Cemetery\Dto\Interments\MoveIntermentDto;
use App\External\Api\Request\Cemetery\Interments\MoveIntermentRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class MoveIntermentController extends Controller
{
    public function __construct(
        private MoveIntermentAction $moveInterment,
    ) {}

    public function __invoke(MoveIntermentRequest $request, string $interment_id): RedirectResponse
    {
        $municipality = app('current_municipality');
        $transfer = $this->moveInterment->execute(
            MoveIntermentDto::fromRequest($interment_id, $request->validated())
        );

        return redirect()->route('cemetery.admin.sites.plots.profile.page', [
            'municipality' => $municipality->slug,
            'cemetery_site_id' => $request->validated('destination_cemetery_site_id'),
            'plot_id' => $transfer->plot_id,
        ])->with('success', 'Interment moved successfully.');
    }
}
