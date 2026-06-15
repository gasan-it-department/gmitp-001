<?php

namespace App\External\Api\Controllers\Cemetery\Decedents;

use App\Core\Cemetery\Actions\Decedents\VerifyDecedentDocumentAction;
use App\External\Api\Request\Cemetery\Decedents\VerifyDocumentRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class VerifyDecedentDocumentController extends Controller
{
    public function __construct(private VerifyDecedentDocumentAction $verifyDocument) {}

    public function __invoke(VerifyDocumentRequest $request, string $decedentId, string $documentId): RedirectResponse
    {
        $data = $request->validated();
        $this->verifyDocument->execute($documentId, $decedentId, app('municipal_id'), $data['approved'], $data['notes'] ?? null);

        return back()->with('success', 'Document review recorded.');
    }
}
