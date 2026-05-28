<?php

namespace App\External\Api\Controllers\Feedback;

use App\Http\Controllers\Controller;
use App\Core\Feedback\Dto\CreateFeedbackDto;
use App\Core\Feedback\UseCases\CreateFeedback;
use App\External\Api\Request\Feedback\FeedbackRequest;

class StoreFeedbackController extends Controller
{
    public function __construct(
        protected CreateFeedback $feedbackService,
    ) {
    }

    public function __invoke(FeedbackRequest $request)
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
}
