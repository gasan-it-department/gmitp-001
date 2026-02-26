<?php

namespace App\External\Web\Controllers\LocalGovernment\Admin;

use App\Core\Government\UseCase\ListOfficialUseCase;
use Inertia\Inertia;
use App\Http\Controllers\Controller;

class ListOfficialsController extends Controller
{

    public function __construct(

        private ListOfficialUseCase $ListOfficialUseCase

    ) {
    }

    public function __invoke()
    {

        $officials = $this->ListOfficialUseCase->execute(app('municipal_id'));

        return Inertia::render('LocalGovernment/Admin/PublicOfficials/List/OfficialsList', [

            'officials' => $officials,

        ]);

    }

}