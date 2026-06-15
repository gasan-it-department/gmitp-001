<?php

namespace App\External\Web\Controllers\Cemetery\Decedents;

use App\Core\Cemetery\Actions\Decedents\GetDecedentProfileAction;
use App\Core\Cemetery\Actions\Decedents\GetIntermentReadinessAction;
use App\Core\Cemetery\Enums\DecedentDocumentType;
use App\Core\Cemetery\Enums\IdentityStatus;
use App\Core\Cemetery\Enums\RegistrationStatus;
use App\Core\Cemetery\Enums\VitalRecordType;
use App\External\Api\Resources\Cemetery\Decedents\DecedentDetailsResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class EditDecedentController extends Controller
{
    public function __construct(
        private GetDecedentProfileAction $getDecedentProfile,
        private GetIntermentReadinessAction $getIntermentReadiness,
    ) {}

    public function __invoke(string $municipality, string $decedentId): Response
    {
        $decedent = $this->getDecedentProfile->execute($decedentId, app('municipal_id'));
        abort_unless(
            in_array($decedent->registration_status, [RegistrationStatus::DRAFT, RegistrationStatus::PENDING_REVIEW], true),
            403,
            'This record cannot be edited directly.',
        );
        $decedent->setRelation('intermentReadiness', $this->getIntermentReadiness->execute($decedent));

        return Inertia::render('Cemetery/Admin/Decedents/Edit/EditDecedents', [
            'municipality' => app('current_municipality'),
            'decedent' => new DecedentDetailsResource($decedent),
            'vital_record_options' => VitalRecordType::toOptions(),
            'identity_status_options' => IdentityStatus::toOptions(),
            'document_type_options' => DecedentDocumentType::toOptions(),
        ]);
    }
}
