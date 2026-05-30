<?php

namespace App\Providers;

use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\Announcement\Models\Announcement;
use App\Core\CommunityReport\Models\ReportSubmission;
use App\Core\Department\Models\Department;
use App\Core\Feedback\Models\FeedbackSubmission;
use App\Core\Procurement\Models\Procurement;
use App\Core\Tourism\Models\TourismAsset;
use App\Core\Users\Models\User;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\ServiceProvider;

class MorphMapServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        Relation::enforceMorphMap([
            'tourism_asset' => TourismAsset::class,
            'procurement' => Procurement::class,
            'user' => User::class,
            'assistance_request' => AssistanceRequest::class,
            'beneficiary' => Beneficiary::class,
            'household_member' => HouseholdMember::class,
            'feedback_submission' => FeedbackSubmission::class,
            'report_submission' => ReportSubmission::class,
            'department' => Department::class,
            'announcement' => Announcement::class,
        ]);
    }
}
