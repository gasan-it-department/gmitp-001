<?php

namespace App\External\Api\Controllers\Cemetery\Decedents;

use App\Core\Cemetery\Actions\Decedents\UpdateDecedentAction;
use App\Core\Cemetery\Dto\Decedents\DecedentDto;
use App\External\Api\Request\Cemetery\Decedents\UpdateDecedentRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class UpdateDecedentController extends Controller
{
    public function __construct(private UpdateDecedentAction $updateDecedent) {}

    public function __invoke(UpdateDecedentRequest $request, string $decedentId): RedirectResponse
    {
        $decedent = $this->updateDecedent->execute(DecedentDto::fromRequest($request->validated()), $decedentId);

        return redirect()->route('cemetery.admin.decedents.profile.page', [
            'municipality' => app('current_municipality')->slug,
            'decedent_id' => $decedent->id,
        ])->with('success', 'Decedent record updated.');
    }
}
