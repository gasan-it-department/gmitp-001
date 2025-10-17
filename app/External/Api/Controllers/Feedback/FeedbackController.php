<?php

namespace App\External\Api\Controllers\Feedback;

use App\Http\Controllers\Controller;
use App\External\Api\Request\Feedback\FeedbackRequest;
use App\Core\Feedback\Applications\Dto\CreateFeedbackDto;
use App\Core\Feedback\Applications\Services\CreateFeedback;

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
            contactNumber: $request->validated('contact_number'),
            email: $request->validated('email'),
            name: $request->validated('name'),
            subject: $request->validated('subject'),
            subjectType: $request->validated('subject_type'),
            departmentId: $request->validated('department_id'),
            rating: $request->validated('rating'),
            message: $request->validated('message'),
            isAnonymous: (bool) $request->validated('is_anonymous'),
            ipAddress: $request->ip(),
            userAgent: $request->userAgent(),
        );

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