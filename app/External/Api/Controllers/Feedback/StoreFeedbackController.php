<?php

namespace App\External\Api\Controllers\Feedback;

use App\Core\Feedback\Actions\SubmitFeedbackAction;
use App\Core\Feedback\Dto\SubmitFeedbackDto;
use App\External\Api\Request\Feedback\SubmitFeedbackRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class StoreFeedbackController extends Controller
{
    public function __construct(
        private SubmitFeedbackAction $submitFeedback,
    ) {
    }

    public function __invoke(SubmitFeedbackRequest $request): RedirectResponse
    {
        $this->submitFeedback->execute(
            SubmitFeedbackDto::fromRequest($request, app('municipal_id')),
        );

        return redirect()->route('feedback.list', ['municipality' => app('current_municipality')->slug])
            ->with('success', 'Thank you for your feedback!');
    }
}
