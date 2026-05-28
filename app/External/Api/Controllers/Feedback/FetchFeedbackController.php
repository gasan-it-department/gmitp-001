<?php

namespace App\External\Api\Controllers\Feedback;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Core\Feedback\Dto\FeedbackQueryDto;
use App\Core\Feedback\UseCases\GetAllFeedback;
use App\External\Api\Resources\Feedback\FeedbackResource;

class FetchFeedbackController extends Controller
{
    public function __construct(
        protected GetAllFeedback $getAllFeedback,
    ) {
    }

    public function __invoke(Request $request)
    {
        try {

            $municipalId = app('municipal_id');

            $dto = new FeedbackQueryDto(
                perPage: $request->get('per_page', 10),
                orderBy: 'created_at',
                direction: 'desc',
            );

            $feedback = $this->getAllFeedback->execute($dto, $municipalId);

            return response()->json([

                'success' => true,

                'data' => FeedbackResource::collection($feedback),

            ]);

        } catch (\Exception $e) {


            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch feedback',
            ], 200);
        }
    }
}
