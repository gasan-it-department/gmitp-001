<?php

namespace App\External\Api\Controllers\Cemetery\Decedents;

use App\Core\Cemetery\Actions\Decedents\VerifyDecedentAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class VerifyDecedentController extends Controller
{
    public function __construct(private VerifyDecedentAction $verifyDecedent) {}

    public function __invoke(string $decedentId): RedirectResponse
    {
        $this->verifyDecedent->execute($decedentId, app('municipal_id'));

        return back()->with('success', 'Decedent registration verified.');
    }
}
