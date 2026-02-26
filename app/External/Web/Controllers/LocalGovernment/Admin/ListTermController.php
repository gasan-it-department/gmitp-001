<?php

namespace App\External\Web\Controllers\LocalGovernment\Admin;

use App\Core\Government\UseCase\ListTermUseCase;
use App\External\Api\Resources\Government\TermResource;
use App\Http\Controllers\Controller;
use inertia\Inertia;

class ListTermController extends Controller
{

    public function __construct(

        private ListTermUseCase $listTermUseCase

    ) {
    }

    public function __invoke()
    {

        $municipalId = app('municipal_id');

        $municipality = app('current_municipality');

        $terms = $this->listTermUseCase->execute($municipalId);

        return Inertia::render('LocalGovernment/Admin/TermsOfService/List/YearTermsList', [

            'terms' => TermResource::collection($terms),

        ]);
    }

}