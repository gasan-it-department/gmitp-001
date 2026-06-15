<?php

namespace App\External\Web\Controllers\Cemetery\Decedents;

use App\Core\Cemetery\Enums\DecedentDocumentType;
use App\Core\Cemetery\Enums\IdentityStatus;
use App\Core\Cemetery\Enums\VitalRecordType;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class CreateDecedentController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Cemetery/Admin/Decedents/Register/RegisterDecedents', [
            'municipality' => app('current_municipality'),
            'vital_record_options' => VitalRecordType::toOptions(),
            'identity_status_options' => IdentityStatus::toOptions(),
            'document_type_options' => DecedentDocumentType::toOptions(),
        ]);
    }
}
