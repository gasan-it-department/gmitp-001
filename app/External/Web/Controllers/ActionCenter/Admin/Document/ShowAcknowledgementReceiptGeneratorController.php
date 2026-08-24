<?php

namespace App\External\Web\Controllers\ActionCenter\Admin\Document;

use App\Core\ActionCenter\UseCase\Assistance\GenerateAcknowledgementReceiptAction;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ShowAcknowledgementReceiptGeneratorController extends Controller
{
    public function __construct(
        private readonly GenerateAcknowledgementReceiptAction $generate,
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
                'ActionCenter/Admin/RequestDetails/AcknowledgementReceiptGenerator',
                ['acknowledgementReceipt' => $form->toArray()],
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
                ->withErrors(['acknowledgement_receipt' => $e->getMessage()]);
        }
    }
}
