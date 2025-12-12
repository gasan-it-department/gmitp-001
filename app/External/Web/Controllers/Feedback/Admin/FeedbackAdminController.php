<?php

namespace App\External\Web\Controllers\Feedback\Admin;

use App\External\Api\Resources\Feedback\FeedbackResource;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Core\Feedback\Dto\FeedbackQueryDto;
use App\Core\Feedback\UseCases\GetAllFeedback;

class FeedbackAdminController
{
    public function show(Request $request, GetAllFeedback $getAllFeedback)
    {

        $municipalId = app('municipal_id');

        $dto = FeedbackQueryDto::fromRequest($request);

        $feedbacks = $getAllFeedback->execute($dto, $municipalId);

        return Inertia::render('Feedback/Admin/FeedbackPage', [

            'feedbacks' => FeedbackResource::collection($feedbacks),

        ]);
    }

    public function showViewingFeedback()
    {

        return Inertia::render('Feedback/Admin/Components/ViewingFeedbackPage');

    }
}