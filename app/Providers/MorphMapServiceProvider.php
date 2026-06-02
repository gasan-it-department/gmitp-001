<?php

namespace App\Providers;

use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\Announcement\Models\Announcement;
use App\Core\Cemetery\Models\Decedent;
use App\Core\CommunityReport\Models\ReportSubmission;
use App\Core\Department\Models\Department;
use App\Core\Event\Models\Event;
use App\Core\Feedback\Models\FeedbackSubmission;
use App\Core\Government\Models\Official;
use App\Core\Government\Models\OfficialTerm;
use App\Core\Government\Models\Position;
use App\Core\Government\Models\Term;
use App\Core\Municipality\Models\Municipality;
use App\Core\Municipality\Models\MunicipalitySettings;
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
            'event' => Event::class,
            'municipality' => Municipality::class,
            'municipality_settings' => MunicipalitySettings::class,
            'official' => Official::class,
            'position' => Position::class,
            'official_term' => OfficialTerm::class,
            'term' => Term::class,
            'decedent' => Decedent::class,
        ]);
    }
}
