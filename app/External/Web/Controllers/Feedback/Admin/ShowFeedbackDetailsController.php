<?php

namespace App\External\Web\Controllers\Feedback\Admin;

use App\Core\Feedback\Actions\GetFeedbackDetailsAction;
use App\External\Api\Resources\Feedback\FeedbackResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ShowFeedbackDetailsController extends Controller
{
    public function __construct(
        private GetFeedbackDetailsAction $getFeedbackDetails,
    ) {
    }

    public function __invoke(string $municipality, string $feedback): Response
    {
        $submission = $this->getFeedbackDetails->execute(
            feedbackId: $feedback,
            municipalId: app('municipal_id'),
        );

        return Inertia::render('Feedback/Admin/Details/Feedbackdetails', [
            'feedback' => (new FeedbackResource($submission))->resolve(),
        ]);
    }
}
