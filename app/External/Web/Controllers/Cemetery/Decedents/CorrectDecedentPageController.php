<?php

namespace App\External\Web\Controllers\Cemetery\Decedents;

use App\Core\Cemetery\Actions\Decedents\GetDecedentProfileAction;
use App\Core\Cemetery\Enums\IdentityStatus;
use App\Core\Cemetery\Enums\RegistrationStatus;
use App\Core\Cemetery\Enums\VitalRecordType;
use App\External\Api\Resources\Cemetery\Decedents\DecedentDetailsResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class CorrectDecedentPageController extends Controller
{
    public function __construct(private GetDecedentProfileAction $getDecedentProfile) {}

    public function __invoke(string $municipality, string $decedentId): Response
    {
        $decedent = $this->getDecedentProfile->execute($decedentId, app('municipal_id'));

        abort_unless(
            $decedent->registration_status === RegistrationStatus::VERIFIED,
            403,
            'Only verified Decedent records can be corrected.',
        );

        return Inertia::render('Cemetery/Admin/Decedents/Correct/CorrectDecedent', [
            'municipality' => app('current_municipality'),
            'decedent' => new DecedentDetailsResource($decedent),
            'vital_record_options' => VitalRecordType::toOptions(),
            'identity_status_options' => IdentityStatus::toOptions(),
        ]);
    }
}
