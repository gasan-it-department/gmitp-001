<?php

namespace App\External\Web\Controllers\ActionCenter\Admin;

use App\Core\ActionCenter\UseCase\Assistance\GetActiveDocumentTypesForDropdown;
use App\Core\ActionCenter\UseCase\Assistance\GetAssistanceTypeAction;
use App\External\Api\Resources\ActionCenter\AssistanceTypeDetails;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class EditAssistanceTypeController extends Controller
{
    public function __construct(
        private GetAssistanceTypeAction $getAssistanceType,
        private GetActiveDocumentTypesForDropdown $getActiveDocumentTypesForDropdown

    ) {
    }
    public function __invoke($municipality, string $typeId)
    {
        $assistance = $this->getAssistanceType->execute(app('municipal_id'), $typeId);
        return Inertia::render('ActionCenter/Admin/Assistance/Create/EditAssistanceType', [
            'existingAssistance' => new AssistanceTypeDetails($assistance),
            'documentTypes' => $this->getActiveDocumentTypesForDropdown->execute(),
        ]);
    }
}