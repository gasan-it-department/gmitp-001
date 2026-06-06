<?php

namespace App\External\Web\Controllers\CommunityReport\Client;

use App\Core\CommunityReport\Actions\CheckEligibilityToReportAction;
use App\Core\CommunityReport\Enums\ReportCategory;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CreateReportController extends Controller
{
    public function __construct(
        private CheckEligibilityToReportAction $checkEligibility
    ) {
    }

    public function __invoke(): Response
    {
        return Inertia::render('CitizenReport/Client/Create', [
            'categories' => ReportCategory::toOptions(),
            'is_eligible' => $this->checkEligibility->execute(Auth::id(), app('municipal_id')),
        ]);
    }
}
