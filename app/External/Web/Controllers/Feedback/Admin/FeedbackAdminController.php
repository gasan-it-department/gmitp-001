<?php

namespace App\External\Web\Controllers\Feedback\Admin;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Core\Feedback\Dto\FeedbackQueryDto;
use App\Core\Feedback\UseCases\GetAllFeedback;
use App\Core\Feedback\UseCases\GetFeedbackUseCase;
use App\External\Api\Resources\Feedback\FeedbackResource;

class FeedbackAdminController
{
    public function index(Request $request, GetAllFeedback $getAllFeedback)
    {

        $municipalId = app('municipal_id');

        $dto = FeedbackQueryDto::fromRequest($request);

        $feedbacks = $getAllFeedback->execute($dto, $municipalId);

        return Inertia::render('Feedback/Admin/List/FeedbackPage', [

            'feedbacks' => FeedbackResource::collection($feedbacks),

        ]);
    }

    public function show($municipality, $feedbackId, Request $request, GetFeedbackUseCase $getFeedbackUseCase)
    {

        $municipalId = app('municipal_id');

        $feedback = $getFeedbackUseCase->execute($municipalId, $feedbackId);

        return Inertia::render('Feedback/Admin/Details/Feedbackdetails', [

            'feedback' => (new FeedbackResource($feedback))->resolve()

        ]);

    }
}