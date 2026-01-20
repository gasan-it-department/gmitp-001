<?php

namespace App\External\Api\Controllers\ActionCenter\Actions;

use App\Core\ActionCenter\Requests\UseCase\CancelAssistanceRequestUseCase;
use App\Http\Controllers\Controller;

class CancelAssistanceRequestController extends Controller
{

    public function __construct(

        private CancelAssistanceRequestUseCase $cancelAssistanceRequestUseCase

    ) {
    }

    public function __invoke($id, CancelAssistanceRequestUseCase $cancelAssistanceRequestUseCase)
    {
        try {

            $cancelAssistanceRequestUseCase->execute($id, auth()->id());

            return back()->with('success', 'Request cancelled successfully');

        } catch (\DomainException $e) {

            return back()->withErrors(['error' => $e->getMessage()]);

        }

    }

}