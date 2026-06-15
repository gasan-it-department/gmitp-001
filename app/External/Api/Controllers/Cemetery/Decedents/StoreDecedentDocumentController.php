<?php

namespace App\External\Api\Controllers\Cemetery\Decedents;

use App\Core\Cemetery\Actions\Decedents\StoreDecedentDocumentAction;
use App\External\Api\Request\Cemetery\Decedents\StoreDocumentRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class StoreDecedentDocumentController extends Controller
{
    public function __construct(private StoreDecedentDocumentAction $storeDocument) {}

    public function __invoke(StoreDocumentRequest $request, string $decedentId): RedirectResponse
    {
        $data = $request->validated();
        $this->storeDocument->execute($decedentId, app('municipal_id'), $data, $request->file('file'));

        return back()->with('success', 'Document uploaded for verification.');
    }
}
