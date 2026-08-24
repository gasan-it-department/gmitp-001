<?php

namespace App\External\Web\Controllers\ActionCenter\Admin\Document;

use App\Core\ActionCenter\UseCase\Assistance\GenerateAcknowledgementReceiptAction;
use App\External\Documents\ActionCenter\Pdf\AcknowledgementReceiptPdf;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;
use Throwable;

class GenerateAcknowledgementReceiptController extends Controller
{
    public function __construct(
        private readonly GenerateAcknowledgementReceiptAction $generate,
        private readonly AcknowledgementReceiptPdf $pdf,
    ) {}

    public function __invoke(
        Request $request,
        string $municipality,
        string $assistanceRequestId,
    ): Response|JsonResponse {
        try {
            $data = $this->generate->execute(
                assistanceRequestId: $assistanceRequestId,
                municipalId: app('municipal_id'),
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
                'message' => 'The Acknowledgement Receipt could not be generated. Please review the request and try again.',
            ], 500);
        }
    }
}
