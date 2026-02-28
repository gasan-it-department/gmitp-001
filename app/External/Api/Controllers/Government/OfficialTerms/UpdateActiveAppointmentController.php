<?php

namespace App\External\Api\Controllers\Government\OfficialTerms;

use App\Core\Government\UseCase\UpdateActiveAppointmentUseCase;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UpdateActiveAppointmentController extends Controller
{

    public function __construct(

        private UpdateActiveAppointmentUseCase $updateHistoricalAppointmentUseCase,

    ) {
    }

    public function __invoke(Request $request, string $appointmentId)
    {

        $validated = $request->validate([
            'start_date' => [
                'required',
                'date',
                // Custom rule idea: 'after_last_historical_end_date'
            ]
        ]);

        $this->updateHistoricalAppointmentUseCase->execute($appointmentId, app('municipal_id'), $validated['start_date']);

        return back()->with('success', 'Appointment start date has been corrected.');
    }

}