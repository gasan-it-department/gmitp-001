<?php

namespace App\External\Web\Controllers\ActionCenter\Admin\Document;

use App\Core\ActionCenter\Dto\Assistance\GenerateCertificateOfEligibilityDto;
use App\Core\ActionCenter\UseCase\Assistance\GenerateCertificateOfEligibilityAction;
use App\External\Api\Request\ActionCenter\GenerateCertificateOfEligibilityRequest;
use App\External\Documents\ActionCenter\Pdf\CertificateOfEligibilityPdf;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;
use Throwable;

class GenerateCertificateOfEligibilityController extends Controller
{
    public function __construct(
        private readonly GenerateCertificateOfEligibilityAction $generate,
        private readonly CertificateOfEligibilityPdf $pdf,
    ) {}

    public function __invoke(
        GenerateCertificateOfEligibilityRequest $request,
        string $municipality,
        string $assistanceRequestId,
    ): Response|JsonResponse {
        try {
            $dto = GenerateCertificateOfEligibilityDto::fromRequest(
                request: $request,
                assistanceRequestId: $assistanceRequestId,
                municipalId: app('municipal_id'),
            );

            $data = $this->generate->execute(
                dto: $dto,
                generatedByUserName: $request->user()->full_name,
            );

            return $this->pdf->response($data);
        } catch (ModelNotFoundException) {
            abort(404, 'Assistance request not found.');
        } catch (AuthorizationException $e) {
            abort(403, $e->getMessage());
        } catch (\DomainException $e) {
            throw ValidationException::withMessages([
                'request' => $e->getMessage(),
            ]);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'The Certificate of Eligibility could not be generated. Please review the form and try again.',
            ], 500);
        }
    }
}
