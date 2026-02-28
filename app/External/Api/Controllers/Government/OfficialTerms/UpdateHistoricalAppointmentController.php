<?php

namespace App\External\Api\Controllers\Government\OfficialTerms;

use App\Core\Government\Dto\UpdateAppointmentHistoryDto;
use App\Core\Government\UseCase\UpdateHistoricalAppointmentUseCase;
use App\External\Api\Request\Government\UpdateHistoryRequest;
use App\Http\Controllers\Controller;

class UpdateHistoricalAppointmentController extends Controller
{

    public function __construct(
        private UpdateHistoricalAppointmentUseCase $updateHistoricalAppointmentUseCase,
    ) {
    }

    public function __invoke(string $appointmentId, UpdateHistoryRequest $request)
    {

        $dto = UpdateAppointmentHistoryDto::fromRequest($request);

        $this->updateHistoricalAppointmentUseCase->execute($appointmentId, app('municipal_id'), $dto);

        return back()->with('success', 'Historical record has been corrected.');
    }

}