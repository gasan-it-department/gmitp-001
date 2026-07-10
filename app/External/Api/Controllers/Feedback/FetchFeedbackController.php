<?php

namespace App\External\Api\Controllers\Feedback;

use App\Core\Feedback\Actions\ListFeedbackSubmissionsAction;
use App\Core\Feedback\Dto\AdminFeedbackFiltersDto;
use App\External\Api\Request\Feedback\Admin\IndexFeedbackRequest;
use App\External\Api\Resources\Feedback\FeedbackResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class FetchFeedbackController extends Controller
{
    public function __construct(
        private ListFeedbackSubmissionsAction $listFeedbackSubmissions,
    ) {
    }

    public function __invoke(IndexFeedbackRequest $request): JsonResponse
    {
        $feedback = $this->listFeedbackSubmissions->execute(
            AdminFeedbackFiltersDto::fromArray($request->filters()),
            app('municipal_id'),
        );

        return response()->json([
            'success' => true,
            'data'    => FeedbackResource::collection($feedback),
        ]);
    }
}
