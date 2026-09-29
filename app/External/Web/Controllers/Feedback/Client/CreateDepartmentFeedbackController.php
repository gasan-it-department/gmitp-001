<?php

namespace App\External\Web\Controllers\Feedback\Client;

use App\Core\Feedback\Actions\CheckEligibilityToSendFeedbackAction;
use App\Core\Feedback\Actions\FindActiveFeedbackDepartmentAction;
use App\Core\Feedback\Enum\FeedbackType;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class CreateDepartmentFeedbackController extends Controller
{
    public function __construct(
        private FindActiveFeedbackDepartmentAction $findDepartment,
        private CheckEligibilityToSendFeedbackAction $checkEligibility,
    ) {}

    public function __invoke(Request $request, string $municipality, string $department): Response
    {
        $municipalId = app('municipal_id');
        $office = $this->findDepartment->execute($department, $municipalId);
        $municipalityLogo = app('current_municipality')->getFirstMedia('logo');

        return Inertia::render('Feedback/Client/Create/DepartmentFeedbackPage', [
            'department' => [
                'id' => $office->id,
                'name' => $office->name,
                'logo_url' => $this->mediaUrl($office->getFirstMedia('department_logo')),
            ],
            'municipality_logo_url' => $this->mediaUrl($municipalityLogo, 'optimized_logo'),
            'submit_url' => route('feedback.department.store', [
                'municipality' => $municipality,
                'department' => $office->id,
            ]),
            'feedbackTypes' => FeedbackType::toOptions(),
            'is_eligible' => $this->checkEligibility->execute($request->user()?->id, $municipalId),
        ]);
    }

    private function mediaUrl(?Media $media, string $conversion = ''): ?string
    {
        if ($media === null) {
            return null;
        }

        if ($conversion !== '' && ! $media->hasGeneratedConversion($conversion)) {
            $conversion = '';
        }

        return $media->disk === 's3'
            ? $media->getTemporaryUrl(now()->addMinutes(15), $conversion)
            : $media->getUrl($conversion);
    }
}
