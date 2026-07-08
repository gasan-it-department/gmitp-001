<?php

namespace App\External\Api\Controllers\V1\SupportTicket;

use App\Core\SupportTicket\Actions\CheckEligibilityToSubmitTicketAction;
use App\Core\SupportTicket\Enums\TicketCategory;
use App\Core\SupportTicket\Enums\TicketPriority;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubmissionContextController extends Controller
{
    public function __construct(
        private CheckEligibilityToSubmitTicketAction $checkEligibility,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        return response()->json([
            'data' => [
                'categories' => TicketCategory::toOptions(),
                'priorities' => TicketPriority::toOptions(),
                'eligibility' => [
                    'is_eligible' => $this->checkEligibility->execute(
                        userId: $request->user()->id,
                        municipalId: app('municipal_id'),
                    ),
                ],
                'constraints' => [
                    'maximum_attachments' => 5,
                    'maximum_attachment_size_mb' => 10,
                    'maximum_subject_length' => 160,
                    'maximum_description_length' => 5000,
                ],
                'defaults' => [
                    'priority' => TicketPriority::NORMAL->value,
                ],
            ],
        ]);
    }
}
