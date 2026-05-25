<?php

namespace App\External\Web\Controllers\ActionCenter\Admin\Document;

use App\Core\ActionCenter\UseCase\Beneficiary\GenerateBeneficiaryIntakeSheetAction;
use App\Core\Municipality\Models\Municipality;
use App\External\Documents\ActionCenter\Pdf\BeneficiaryIntakeSheetPdf;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Spatie\LaravelPdf\PdfBuilder;

/**
 * Admin "Download Beneficiary Intake Sheet (PDF)" endpoint.
 *
 * Route: GET /{municipality}/action-center/admin/beneficiary/{beneficiaryId}/intake-sheet.pdf
 *
 * Thin controller — no queries beyond resolving the municipality display
 * name (which lives outside the Beneficiary aggregate). The Action gathers
 * everything else; the PDF class renders. The response is returned inline
 * so the admin sees it open in the browser tab and can ctrl+P or save as.
 *
 * Auth model:
 *   • Behind admin middleware (must be an MSWD worker)
 *   • Tenant + ownership-of-data enforced inside the action (beneficiary's
 *     household.municipal_id must equal the active municipality)
 */
class DownloadBeneficiaryIntakeSheetController extends Controller
{
    public function __construct(
        private readonly GenerateBeneficiaryIntakeSheetAction $generate,
        private readonly BeneficiaryIntakeSheetPdf $pdf,
    ) {
    }

    public function __invoke(
        Request $request,
        string $municipality,
        string $beneficiaryId,
    ): PdfBuilder {
        try {
            $municipalId = app('municipal_id');
            $user = $request->user();

            $data = $this->generate->execute(
                beneficiaryId: $beneficiaryId,
                municipalId: $municipalId,
                municipalityName: $this->resolveMunicipalityName($municipalId),
                generatedByUserName: $user->full_name,
            );

            return $this->pdf->build($data);
        } catch (ModelNotFoundException) {
            abort(404, 'Beneficiary not found.');
        } catch (AuthorizationException $e) {
            abort(403, $e->getMessage());
        }
    }

    /**
     * Look up the municipality's display name from the FK. Kept here
     * (not in the Action) because the Action belongs to the ActionCenter
     * Core layer and shouldn't reach into a sibling domain. The controller
     * is the natural seam to compose those two layers.
     */
    private function resolveMunicipalityName(string $municipalId): ?string
    {
        return Municipality::query()
            ->whereKey($municipalId)
            ->value('name');
    }
}
