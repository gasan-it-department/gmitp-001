<?php

namespace App\External\Web\Controllers\Feedback\Client;

use App\Core\Department\Models\Department;
use App\Core\Feedback\Actions\CheckEligibilityToSendFeedbackAction;
use App\Core\Feedback\Enum\FeedbackType;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CreateFeedbackController extends Controller
{
    public function __construct(
        private CheckEligibilityToSendFeedbackAction $checkEligibility,
    ) {}

    public function __invoke(Request $request): Response
    {
        $municipalId = app('municipal_id');

        $departments = Department::query()
            ->where('municipal_id', $municipalId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn ($d) => ['id' => $d->id, 'name' => $d->name])
            ->values();

        return Inertia::render('Feedback/Client/Create/GiveFeedback', [
            'feedbackTypes' => FeedbackType::toOptions(),
            'departments' => $departments,
            'is_eligible' => $this->checkEligibility->execute(
                userId: $request->user()?->id,
                municipalId: $municipalId,
            ),
        ]);
    }
}
