<?php

namespace App\External\Web\Controllers\Procurement\Admin;

use App\Core\Procurement\UseCases\GetProcurementUseCase;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class EditProcurementController extends Controller
{
    public function __invoke($municipality, $id, GetProcurementUseCase $getProcurementUseCase)
    {

        $getProcurementUseCase = $getProcurementUseCase->execute($id, app('municipal_id'));

        return Inertia::render('PublicInformation/Admin/Procurement/Edit/Edit');

    }

}