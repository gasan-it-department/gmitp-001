<?php

namespace App\External\Web\Controllers\Cemetery\Decedent;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

/**
 * Renders the blank "register decedent" form page. No data fetch required — the
 * form posts to StoreDecedentController.
 */
class CreateDecedentController extends Controller
{
    public function __invoke()
    {
        return Inertia::render('Cemetery/Admin/Decedents/Register/RegisterDecedents', [
            'municipality' => app('current_municipality'),
        ]);
    }
}
