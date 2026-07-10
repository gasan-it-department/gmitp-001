<?php

namespace App\External\Web\Controllers\Feedback\Client;

use App\Core\Feedback\Actions\ListDepartmentRatingsAction;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class DepartmentRatingsController extends Controller
{
    public function __construct(
        private ListDepartmentRatingsAction $listDepartmentRatings,
    ) {}

    public function __invoke(): Response
    {
        $ratings = $this->listDepartmentRatings->execute(app('municipal_id'));

        return Inertia::render('Feedback/Client/DepartmentsRating/DepartmentRatingsPage', [
            'departments' => $ratings['departments'],
            'summary' => $ratings['summary'],
            'minimum_feedback_count' => $ratings['minimum_feedback_count'],
        ]);
    }
}
