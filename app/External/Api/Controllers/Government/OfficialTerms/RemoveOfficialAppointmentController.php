<?php

namespace App\External\Api\Controllers\Government\OfficialTerms;

use App\Core\Government\UseCase\RemoveOfficialAppointmentUseCase;
use App\Http\Controllers\Controller;

class RemoveOfficialAppointmentController extends Controller
{

    public function __construct(
        private RemoveOfficialAppointmentUseCase $removeOfficialAppointment,
    ) {
    }
    public function __invoke(string $id)
    {

        $this->removeOfficialAppointment->execute($id, app('municipal_id'));

        return redirect()->back()->with('success', 'Appointed official successfully removed.');

    }

}