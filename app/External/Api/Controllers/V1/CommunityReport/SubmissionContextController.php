<?php

namespace App\External\Api\Controllers\V1\CommunityReport;

use App\Core\CommunityReport\Actions\CheckEligibilityToReportAction;
use App\Core\CommunityReport\Enums\ReportCategory;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubmissionContextController extends Controller
{
    public function __construct(
        private CheckEligibilityToReportAction $checkEligibility,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        return response()->json([
            'data' => [
                'categories' => ReportCategory::toOptions(),

                'eligibility' => [
                    'is_eligible' => $this->checkEligibility->execute(
                        userId: $request->user()->id,
                        municipalId: app('municipal_id'),
                    ),
                ],

                'constraints' => [
                    'maximum_photos' => 5,
                    'maximum_photo_size_mb' => 10,
                    'maximum_description_length' => 5000,
                ],
            ],
        ]);
    }
}