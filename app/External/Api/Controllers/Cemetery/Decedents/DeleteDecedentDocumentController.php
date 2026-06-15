<?php

namespace App\External\Api\Controllers\Cemetery\Decedents;

use App\Core\Cemetery\Actions\Decedents\DeleteDecedentDocumentAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class DeleteDecedentDocumentController extends Controller
{
    public function __construct(private DeleteDecedentDocumentAction $deleteDocument) {}

    public function __invoke(string $decedentId, string $documentId): RedirectResponse
    {
        $this->deleteDocument->execute($documentId, $decedentId, app('municipal_id'));

        return back()->with('success', 'Document removed.');
    }
}
