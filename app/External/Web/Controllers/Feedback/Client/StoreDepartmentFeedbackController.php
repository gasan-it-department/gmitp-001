<?php

namespace App\External\Web\Controllers\Feedback\Client;

use App\Core\Feedback\Actions\SubmitFeedbackAction;
use App\Core\Feedback\Dto\SubmitFeedbackDto;
use App\Core\Feedback\Exceptions\FeedbackLimitExceededException;
use App\External\Web\Requests\Feedback\SubmitDepartmentFeedbackRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class StoreDepartmentFeedbackController extends Controller
{
    public function __construct(private SubmitFeedbackAction $submitFeedback)
    {
    }

    public function __invoke(SubmitDepartmentFeedbackRequest $request): RedirectResponse
    {
        $municipality = app('current_municipality');

        try {
            $this->submitFeedback->execute(SubmitFeedbackDto::fromRequest($request, app('municipal_id')));
        } catch (FeedbackLimitExceededException $exception) {
            return back()->withErrors(['feedback' => $exception->getMessage()]);
        }

        return redirect()
            ->route('home', ['municipality' => $municipality->slug])
            ->with('success', 'Thank you for your feedback!');
    }
}
