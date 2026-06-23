<?php

namespace App\External\Api\Controllers\Cemetery\Decedents;

use App\Core\Cemetery\Actions\Decedents\StoreDecedentAction;
use App\Core\Cemetery\Dto\Decedents\DecedentDto;
use App\External\Api\Request\Cemetery\Decedents\CreateDecedentRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class StoreDecedentController extends Controller
{
    public function __construct(private StoreDecedentAction $storeDecedent)
    {
    }

    public function __invoke(CreateDecedentRequest $request): RedirectResponse
    {
        $decedent = $this->storeDecedent->execute(DecedentDto::fromRequest($request->validated()));

        return redirect()->route('cemetery.admin.decedents.profile.page', [
            'municipality' => app('current_municipality')->slug,
            'decedent_id' => $decedent->id,
        ])->with('success', $decedent->registration_status->value === 'draft'
                ? 'Draft saved successfully.'
                : 'Decedent submitted for review.');
    }
}
