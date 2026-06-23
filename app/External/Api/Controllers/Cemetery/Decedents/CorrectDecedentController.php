<?php

namespace App\External\Api\Controllers\Cemetery\Decedents;

use App\Core\Cemetery\Actions\Decedents\CorrectDecedentAction;
use App\External\Api\Request\Cemetery\Decedents\CorrectDecedentRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class CorrectDecedentController extends Controller
{
    public function __construct(private CorrectDecedentAction $correctDecedent) {}

    public function __invoke(CorrectDecedentRequest $request, string $decedentId): RedirectResponse
    {
        $data = $request->validated();
        $this->correctDecedent->execute(
            $decedentId,
            app('municipal_id'),
            $data['version'],
            $data['changes'],
            $data['reason'],
            $request->file('evidence'),
        );

        return back()->with('success', 'Decedent record corrected.');
    }
}
