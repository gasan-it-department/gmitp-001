<?php

namespace App\External\Web\Controllers\ActionCenter\Admin\Document;

use App\Core\ActionCenter\UseCase\Beneficiary\GenerateBeneficiaryIdentityDocumentSheetAction;
use App\Core\Municipality\Models\Municipality;
use App\External\Documents\ActionCenter\Pdf\BeneficiaryIdentityDocumentSheetPdf;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Spatie\LaravelPdf\PdfBuilder;

class DownloadBeneficiaryIdentityDocumentSheetController extends Controller
{
    public function __construct(
        private readonly GenerateBeneficiaryIdentityDocumentSheetAction $generate,
        private readonly BeneficiaryIdentityDocumentSheetPdf $pdf,
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

    private function resolveMunicipalityName(string $municipalId): ?string
    {
        return Municipality::query()
            ->whereKey($municipalId)
            ->value('name');
    }
}
