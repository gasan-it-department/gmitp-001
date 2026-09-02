<?php

namespace App\External\Web\Controllers\ActionCenter\Admin;

use App\Core\ActionCenter\Enums\AssistanceGeneratedDocument;
use App\Core\ActionCenter\UseCase\Assistance\GetActiveDocumentTypesForDropdown;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class CreateAssistanceTypeController extends Controller
{
    public function __construct(
        private GetActiveDocumentTypesForDropdown $getActiveDocumentTypesForDropdown
    ) {}

    public function __invoke()
    {
        return Inertia::render('ActionCenter/Admin/Assistance/Create/CreateAssistanceType', [
            'documentTypes' => $this->getActiveDocumentTypesForDropdown->execute(app('municipal_id')),
            'generatedDocumentOptions' => AssistanceGeneratedDocument::options(),
        ]);
    }
}
