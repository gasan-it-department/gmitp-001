<?php

namespace App\External\Web\Controllers\PublicInformation\Admin;

use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Core\PublicInformation\UseCases\GetProcurementUseCase;

class EditProcurementController extends Controller
{
    public function __invoke($municipality, $id, GetProcurementUseCase $getProcurementUseCase)
    {

        $getProcurementUseCase = $getProcurementUseCase->execute($id, app('municipal_id'));

        return Inertia::render('PublicInformation/Admin/Procurement/Edit/Edit');

    }

}