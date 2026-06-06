<?php

namespace App\External\Web\Controllers\Feedback\Client;

use App\Core\Department\Models\Department;
use App\Core\Feedback\Actions\CheckEligibilityToSendFeedbackAction;
use App\Core\Feedback\Enum\FeedbackType;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CreateFeedbackController extends Controller
{
    public function __construct(
        private CheckEligibilityToSendFeedbackAction $checkEligibility
    ) {
    }

    public function __invoke(): Response
    {
        $departments = Department::query()
            ->where('municipal_id', app('municipal_id'))
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn($d) => ['id' => $d->id, 'name' => $d->name])
            ->values();

        return Inertia::render('Feedback/Client/Create/GiveFeedback', [
            'feedbackTypes' => FeedbackType::toOptions(),
            'departments' => $departments,
            'is_eligible' => $this->checkEligibility->execute(Auth::id(), app('municipal_id')),
        ]);
    }
}
