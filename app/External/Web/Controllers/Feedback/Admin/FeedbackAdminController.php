<?php

namespace App\External\Web\Controllers\Feedback\Admin;

use App\Core\Department\Models\Department;
use App\Core\Feedback\Actions\ListFeedbackSubmissionsAction;
use App\Core\Feedback\Dto\AdminFeedbackFiltersDto;
use App\Core\Feedback\Enum\FeedbackType;
use App\External\Api\Request\Feedback\Admin\IndexFeedbackRequest;
use App\External\Api\Resources\Feedback\FeedbackResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class FeedbackAdminController extends Controller
{
    public function __construct(
        private ListFeedbackSubmissionsAction $listFeedbackSubmissions,
    ) {
    }

    public function index(IndexFeedbackRequest $request): Response
    {
        $municipalId = app('municipal_id');
        $filters = AdminFeedbackFiltersDto::fromArray($request->filters());

        $feedbacks = $this->listFeedbackSubmissions->execute(
            $filters,
            $municipalId,
        );

        return Inertia::render('Feedback/Admin/List/FeedbackPage', [
            'feedbacks' => FeedbackResource::collection($feedbacks),
            'filters' => $filters->toArray(),
            'department_options' => Department::query()
                ->where('municipal_id', $municipalId)
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (Department $department) => [
                    'value' => $department->id,
                    'label' => $department->name,
                ])
                ->values(),
            'subject_options' => FeedbackType::toOptions(),
            'rating_options' => collect(range(5, 1))->map(fn (int $rating) => [
                'value' => (string) $rating,
                'label' => "{$rating} star".($rating === 1 ? '' : 's'),
            ])->values(),
            'visibility_options' => [
                ['value' => AdminFeedbackFiltersDto::VISIBILITY_ANONYMOUS, 'label' => 'Anonymous'],
                ['value' => AdminFeedbackFiltersDto::VISIBILITY_IDENTIFIED, 'label' => 'Identified'],
            ],
            'target_options' => [
                ['value' => AdminFeedbackFiltersDto::TARGET_EMPLOYEE, 'label' => 'Employee feedback'],
                ['value' => AdminFeedbackFiltersDto::TARGET_DEPARTMENT, 'label' => 'Department only'],
                ['value' => AdminFeedbackFiltersDto::TARGET_UNASSIGNED, 'label' => 'Unassigned'],
            ],
            'attachment_options' => [
                ['value' => AdminFeedbackFiltersDto::HAS_ATTACHMENTS_YES, 'label' => 'With photos'],
                ['value' => AdminFeedbackFiltersDto::HAS_ATTACHMENTS_NO, 'label' => 'Without photos'],
            ],
            'sort_options' => [
                ['value' => AdminFeedbackFiltersDto::SORT_NEWEST, 'label' => 'Newest first'],
                ['value' => AdminFeedbackFiltersDto::SORT_OLDEST, 'label' => 'Oldest first'],
                ['value' => AdminFeedbackFiltersDto::SORT_RATING_HIGH, 'label' => 'Rating: high to low'],
                ['value' => AdminFeedbackFiltersDto::SORT_RATING_LOW, 'label' => 'Rating: low to high'],
            ],
            'per_page_options' => AdminFeedbackFiltersDto::PER_PAGE_OPTIONS,
        ]);
    }
}
