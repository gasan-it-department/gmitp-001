<?php

namespace App\External\Api\Controllers\Feedback;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Core\Feedback\Models\Feedback;
use App\Core\Feedback\Dto\FeedbackQueryDto;
use App\Core\Feedback\Dto\CreateFeedbackDto;
use App\Core\Feedback\UseCases\CreateFeedback;
use App\Core\Feedback\UseCases\GetAllFeedback;
use App\External\Api\Request\Feedback\FeedbackRequest;
use App\External\Api\Resources\Feedback\FeedbackResource;

class FeedbackController extends Controller
{

    public function __construct(
        protected CreateFeedback $feedbackService,
        protected GetAllFeedback $getAllFeedback,
    ) {
    }
    public function store(FeedbackRequest $request)
    {
        try {
            //validate the inputs via request
            $validated = $request->validated();


            $municipality = app('current_municipality');

            //ternary check if file exist in the request 
            $files = $request->hasFile('feedback_files') ? $request->file('feedback_files') : [];
            //form the (data transfer object) to be pass and process in the service
            $dto = new CreateFeedbackDto(
                userId: $request->user()?->id,
                senderName: $validated['sender_name'] ?? null,
                employeeName: $validated['employee_name'] ?? null,
                feedbackTarget: $validated['feedback_target'],
                departmentId: $validated['department_id'] ?? null,
                rating: $validated['rating'] ?? null,
                message: $validated['feedback_message'],
                feedbackFiles: $files,
                ipAddress: $request->ip(),
                municipalId: $municipality->id,
                userAgent: $request->userAgent(),
                municipalName: $municipality->name,
            );
            // call the service to process the feedback of citizen
            $feedback = $this->feedbackService->execute($dto);

            return response()->json([
                'success' => true,
                'message' => 'Feedback submitted successfully',
                'data' => $feedback,
            ], 201);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'Failed to submit feedback',
                'error' => $e->getMessage()
            ], 500);

        }
    }

    public function fetch(Request $request)
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

            \Log::error("Fetch feedback failed: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch feedback',
            ], 200);
        }
    }


    public function show()
    {

    }

    public function update()
    {

    }
}