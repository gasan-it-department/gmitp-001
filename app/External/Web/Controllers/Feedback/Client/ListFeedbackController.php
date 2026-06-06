<?php

namespace App\External\Web\Controllers\Feedback\Client;

use App\Core\Feedback\Actions\ListMyFeedbackAction;
use App\Core\Feedback\Dto\FeedbackQueryDto;
use App\External\Api\Resources\Feedback\FeedbackResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ListFeedbackController extends Controller
{
    public function __construct(
        private ListMyFeedbackAction $listMyFeedback,
    ) {
    }

    public function __invoke(Request $request): Response
    {
        $feedback = $this->listMyFeedback->execute(
            userId: Auth::id(),
            municipalId: app('municipal_id'),
            dto: FeedbackQueryDto::fromRequest($request),
        );

        return Inertia::render('Feedback/Client/List/FeedbackList', [
            'feedback' => FeedbackResource::collection($feedback),
        ]);
    }
}
