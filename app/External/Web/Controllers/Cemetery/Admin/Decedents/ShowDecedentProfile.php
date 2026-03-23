<?php

namespace App\External\Web\Controllers\Cemetery\Admin\Decedents;

use App\Core\Cemetery\UseCase\ViewDecedentProfileUseCase;
use App\External\Api\Resources\Cemetery\DecedentDetailsResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ShowDecedentProfile extends Controller
{

    public function __construct(
        private ViewDecedentProfileUseCase $viewDecedentProfileUseCase
    ) {
    }
    public function __invoke(string $municipality, string $decedentId)
    {

        $decedent = $this->viewDecedentProfileUseCase->execute($decedentId, app('municipal_id'));

        return Inertia::render('Cemetery/Admin/Decedents/Profile/DecedentProfile', [
            'decedent' => new DecedentDetailsResource($decedent),
        ]);
    }

}