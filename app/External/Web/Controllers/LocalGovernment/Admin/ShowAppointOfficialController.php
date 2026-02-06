<?php

namespace App\External\Web\Controllers\LocalGovernment\Admin;

use App\Core\Government\UseCase\GetTermDetailsUseCase;
use App\External\Api\Resources\Government\TermResource;
use Inertia\Inertia;
use App\Http\Controllers\Controller;

class ShowAppointOfficialController extends Controller
{

    public function __construct(

        private GetTermDetailsUseCase $getTermDetailsUseCase,

    ) {
    }

    public function __invoke(string $municipalId, string $termId)
    {

        $term = $this->getTermDetailsUseCase->execute($termId, app('municipal_id'));

        return Inertia::render('LocalGovernment/Admin/AppointOfficial/AppointOfficial', [

            'term' => new TermResource($term),

            'officials',

        ]);

    }

}