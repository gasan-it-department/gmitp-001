<?php

namespace App\External\Web\Controllers\Feedback\Client;

use App\Core\Department\UseCases\GetActiveDepartmentUseCase;
use App\Core\Feedback\Enum\FeedbackType;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class CreateFeedbackController extends Controller
{
    public function __construct(
        private GetActiveDepartmentUseCase $getActiveDepartments,
    ) {
    }

    public function __invoke(): Response
    {
        $departments = $this->getActiveDepartments
            ->execute(app('municipal_id'))
            ->map(fn($d) => ['id' => $d->id, 'name' => $d->name])
            ->values();

        return Inertia::render('Feedback/Client/Create/GiveFeedback', [
            'feedbackTypes' => FeedbackType::toOptions(),
            'departments' => $departments,
        ]);
    }
}
