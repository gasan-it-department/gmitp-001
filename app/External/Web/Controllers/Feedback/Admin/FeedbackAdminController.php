<?php

namespace App\External\Web\Controllers\Feedback\Admin;

use App\Core\Feedback\Actions\GetAdminFeedbackAction;
use App\Core\Feedback\Actions\ListFeedbackSubmissionsAction;
use App\Core\Feedback\Dto\FeedbackQueryDto;
use App\External\Api\Resources\Feedback\FeedbackResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeedbackAdminController extends Controller
{
    public function __construct(
        private ListFeedbackSubmissionsAction $listFeedbackSubmissions,
        private GetAdminFeedbackAction $getAdminFeedback,
    ) {
    }

    public function index(Request $request): Response
    {
        $feedbacks = $this->listFeedbackSubmissions->execute(
            FeedbackQueryDto::fromRequest($request),
            app('municipal_id'),
        );

        return Inertia::render('Feedback/Admin/List/FeedbackPage', [
            'feedbacks' => FeedbackResource::collection($feedbacks),
        ]);
    }

    public function show(string $municipality, string $feedback): Response
    {
        $submission = $this->getAdminFeedback->execute(
            feedbackId:  $feedback,
            municipalId: app('municipal_id'),
        );

        return Inertia::render('Feedback/Admin/Details/Feedbackdetails', [
            'feedback' => (new FeedbackResource($submission))->resolve(),
        ]);
    }
}
