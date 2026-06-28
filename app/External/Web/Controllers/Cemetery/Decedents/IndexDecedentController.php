<?php

namespace App\External\Web\Controllers\Cemetery\Decedents;

use App\Core\Cemetery\Actions\Decedents\ListDecedentsAction;
use App\Core\Cemetery\Dto\Decedents\DecedentListFiltersDto;
use App\Core\Cemetery\Enums\IdentityStatus;
use App\Core\Cemetery\Enums\RegistrationStatus;
use App\Core\Cemetery\Enums\VitalRecordType;
use App\External\Api\Request\Cemetery\Decedents\ListDecedentsRequest;
use App\External\Api\Resources\Cemetery\Decedents\DecedentListResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class IndexDecedentController extends Controller
{
    public function __construct(private ListDecedentsAction $listDecedents) {}

    public function __invoke(ListDecedentsRequest $request): Response
    {
        $filters = DecedentListFiltersDto::fromArray($request->filters());

        return Inertia::render('Cemetery/Admin/Decedents/List/ListDecedents', [
            'decedents' => DecedentListResource::collection($this->listDecedents->execute(app('municipal_id'), $filters)),
            'filters' => $filters->toArray(),
            'registration_status_options' => RegistrationStatus::toOptions(),
            'identity_status_options' => IdentityStatus::toOptions(),
            'vital_record_type_options' => VitalRecordType::toOptions(),
            'interment_status_options' => [
                ['value' => 'interred', 'label' => 'Interred'],
                ['value' => 'unassigned', 'label' => 'Unassigned'],
            ],
        ]);
    }
}
