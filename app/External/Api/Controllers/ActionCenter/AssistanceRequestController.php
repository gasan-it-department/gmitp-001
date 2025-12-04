<?php

namespace App\External\Api\Controllers\ActionCenter;

use App\Core\ActionCenter\Requests\Dto\SetAssistanceAmountDto;
use App\Core\ActionCenter\Requests\UseCase\SetAssistanceAmountUseCase;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class AssistanceRequestController extends Controller
{

    public function __construct(
        private SetAssistanceAmountUseCase $setAssistanceAmountUseCase
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

}