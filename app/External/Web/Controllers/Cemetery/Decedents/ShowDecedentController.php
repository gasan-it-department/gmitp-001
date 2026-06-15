<?php

namespace App\External\Web\Controllers\Cemetery\Decedents;

use App\Core\Cemetery\Actions\Decedents\GetDecedentProfileAction;
use App\Core\Cemetery\Actions\Decedents\GetIntermentReadinessAction;
use App\Core\Cemetery\Enums\DecedentDocumentType;
use App\External\Api\Resources\Cemetery\Decedents\DecedentDetailsResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ShowDecedentController extends Controller
{
    public function __construct(
        private GetDecedentProfileAction $getDecedentProfile,
        private GetIntermentReadinessAction $getIntermentReadiness,
    ) {}

    public function __invoke(string $municipality, string $decedentId): Response
    {
        $decedent = $this->getDecedentProfile->execute($decedentId, app('municipal_id'));
        $decedent->setRelation('intermentReadiness', $this->getIntermentReadiness->execute($decedent));
        $user = request()->user();

        return Inertia::render('Cemetery/Admin/Decedents/Profile/DecedentProfile', [
            'decedent' => new DecedentDetailsResource($decedent),
            'document_type_options' => DecedentDocumentType::toOptions(),
            'abilities' => [
                'manage' => $user->can('cemetery.decedents.manage'),
                'verify' => $user->can('cemetery.decedents.verify'),
                'correct' => $user->can('cemetery.decedents.correct'),
                'override' => $user->can('cemetery.decedents.override'),
                'view_documents' => $user->can('cemetery.decedents.documents.view'),
            ],
        ]);
    }
}
