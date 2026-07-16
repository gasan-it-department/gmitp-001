<?php

namespace App\External\Api\Controllers\Cemetery\Decedents;

use App\Core\Cemetery\Actions\Decedents\DeleteDraftDecedentAction;
use App\External\Api\Request\Cemetery\Decedents\DeleteDraftDecedentRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class DeleteDraftDecedentController extends Controller
{
    public function __construct(private DeleteDraftDecedentAction $deleteDraft) {}

    public function __invoke(DeleteDraftDecedentRequest $request, string $decedentId): RedirectResponse
    {
        $this->deleteDraft->execute(
            $decedentId,
            app('municipal_id'),
            $request->validated('reason'),
        );

        return redirect()->route('cemetery.admin.decedents.list.page', [
            'municipality' => app('current_municipality')->slug,
        ])->with('success', 'Unverified Decedent record deleted.');
    }
}
