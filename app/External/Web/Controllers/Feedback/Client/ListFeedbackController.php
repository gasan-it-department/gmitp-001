<?php

namespace App\External\Web\Controllers\Feedback\Client;

use App\Core\Feedback\Dto\FeedbackQueryDto;
use App\External\Api\Resources\Feedback\FeedbackResource;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Core\Feedback\UseCases\ListUserFeedbackUseCase;

class ListFeedbackController extends Controller
{

    public function __invoke(Request $request, ListUserFeedbackUseCase $listUserFeedbackUseCase)
    {
        $municipalId = app('municipal_id');

        $dto = FeedbackQueryDto::fromRequest($request);

        $feedback = $listUserFeedbackUseCase->execute(auth()->id(), $municipalId, $dto);

        return Inertia::render('Feedback/Client/List/FeedbackList', [

            'feedback' => FeedbackResource::collection($feedback),

        ]);

    }

}