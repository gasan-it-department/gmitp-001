<?php

namespace App\External\Api\Controllers\Feedback;

use App\Core\Feedback\Actions\ListFeedbackSubmissionsAction;
use App\Core\Feedback\Dto\FeedbackQueryDto;
use App\External\Api\Resources\Feedback\FeedbackResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FetchFeedbackController extends Controller
{
    public function __construct(
        private ListFeedbackSubmissionsAction $listFeedbackSubmissions,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $feedback = $this->listFeedbackSubmissions->execute(
            FeedbackQueryDto::fromRequest($request),
            app('municipal_id'),
        );

        return response()->json([
            'success' => true,
            'data'    => FeedbackResource::collection($feedback),
        ]);
    }
}
