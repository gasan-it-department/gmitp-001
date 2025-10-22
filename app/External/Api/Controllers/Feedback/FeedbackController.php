<?php

namespace App\External\Api\Controllers\Feedback;

use App\Http\Controllers\Controller;
use App\External\Api\Request\Feedback\FeedbackRequest;
use App\Core\Feedback\Dto\CreateFeedbackDto;
use App\Core\Feedback\Services\CreateFeedback;

class FeedbackController extends Controller
{

    public function __construct(
        protected CreateFeedback $feedbackService,
    ) {
    }
    public function store(FeedbackRequest $request)
    {
        $dto = new CreateFeedbackDto(
            userId: $request->user()?->id,
            senderName: $request->validated('senderName'),
            employeeName: $request->validated('employeeName'),
            subjectType: $request->validated('subjectType'),
            departmentId: $request->validated('departmentId'),
            rating: $request->validated('rating'),
            message: $request->validated('message'),
            isAnonymous: (bool) $request->validated('isAnonymous'),
            ipAddress: $request->ip(),
            userAgent: $request->userAgent(),
        );
        dd($dto);
        $this->feedbackService->execute($dto);
    }

    public function index()
    {

    }

    public function show()
    {

    }

    public function update()
    {

    }
}