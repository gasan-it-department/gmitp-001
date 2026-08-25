<?php

namespace App\External\Web\Controllers\ActionCenter\Admin\Document;

use App\Core\ActionCenter\UseCase\Assistance\GenerateFinancialDocumentPacketAction;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ShowFinancialDocumentPacketGeneratorController extends Controller
{
    public function __construct(
        private readonly GenerateFinancialDocumentPacketAction $generate,
    ) {}

    public function __invoke(
        string $municipality,
        string $assistanceRequestId,
    ): Response|RedirectResponse {
        try {
            $form = $this->generate->formData(
                assistanceRequestId: $assistanceRequestId,
                municipalId: app('municipal_id'),
            );

            return Inertia::render(
                'ActionCenter/Admin/RequestDetails/FinancialDocumentPacketGenerator',
                ['financialDocumentPacket' => $form->toArray()],
            );
        } catch (ModelNotFoundException) {
            abort(404, 'Assistance request not found.');
        } catch (AuthorizationException $e) {
            abort(403, $e->getMessage());
        } catch (\DomainException $e) {
            return redirect()
                ->route('actionCenter.admin.show.assistance-request.profile', [
                    'municipality' => $municipality,
                    'assistanceRequest' => $assistanceRequestId,
                ])
                ->withErrors(['financial_document_packet' => $e->getMessage()]);
        }
    }
}
