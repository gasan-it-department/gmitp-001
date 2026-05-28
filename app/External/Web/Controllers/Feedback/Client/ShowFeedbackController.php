<?php

namespace App\External\Web\Controllers\Feedback\Client;

use App\Core\Feedback\Actions\GetClientFeedbackAction;
use App\External\Api\Resources\Feedback\FeedbackResource;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ShowFeedbackController extends Controller
{
    public function __construct(
        private GetClientFeedbackAction $getClientFeedback,
    ) {
    }

    public function __invoke(string $municipality, string $feedback): Response
    {
        $submission = $this->getClientFeedback->execute(
            feedbackId:  $feedback,
            municipalId: app('municipal_id'),
            userId:      Auth::id(),
        );

        return Inertia::render('Feedback/Client/Show/FeedbackShow', [
            'feedback' => (new FeedbackResource($submission))->resolve(),
        ]);
    }
}
