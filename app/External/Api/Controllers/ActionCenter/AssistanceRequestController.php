<?php

namespace App\External\Api\Controllers\ActionCenter;

use Auth;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Redirect;
use App\Core\ActionCenter\Requests\Dto\SetAssistanceAmountDto;
use App\Core\ActionCenter\Requests\UseCase\SetAssistanceAmountUseCase;
use App\Core\ActionCenter\Requests\UseCase\CancelAssistanceRequestUseCase;

class AssistanceRequestController extends Controller
{

    public function __construct(
        private SetAssistanceAmountUseCase $setAssistanceAmountUseCase,
        private CancelAssistanceRequestUseCase $cancelAssistanceRequestUseCase,
    ) {
    }

    public function store()
    {

    }

    public function setAmount(string $id, Request $request)
    {

        $validated = $request->validate([
            'amount' => [

                'required',

                'numeric',

                'min:1',

                'max:1000000',

                'regex:/^\d+(\.\d{1,2})?$/'

            ]
        ]);

        $dto = new SetAssistanceAmountDto(

            assistanceId: $id,

            amount: $validated['amount'],

        );

        $this->setAssistanceAmountUseCase->execute($dto);

        return response()->json([

            'success' => true,

            'message' => 'Amount successfuly added.'

        ], 200);

    }

    public function cancel(Request $request, $requestId)
    {
        try {
            $userId = Auth::id();

            $this->cancelAssistanceRequestUseCase->execute($requestId, $userId);

            return Redirect::back()->with('flash', [
                'type' => 'success',
                'title' => 'Request Cancelled',
                'message' => 'Your assistance request has been successfully cancelled.'
            ]);

        } catch (\Exception $e) {
            return Redirect::back()->with('flash', [
                'type' => 'error',
                'title' => 'Cancellation Failed',
                'message' => $e->getMessage()
            ]);
        }
    }

}