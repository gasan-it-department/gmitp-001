<?php

namespace App\External\Web\Controllers\ActionCenter\Admin\Document;

use App\Core\ActionCenter\Dto\Assistance\GenerateAssistanceRequestIntakeSheetDto;
use App\Core\ActionCenter\UseCase\Assistance\GenerateAssistanceRequestIntakeSheetAction;
use App\External\Api\Request\ActionCenter\GenerateAssistanceRequestIntakeSheetRequest;
use App\External\Documents\ActionCenter\Pdf\AssistanceRequestIntakeSheetPdf;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;
use Throwable;

class GenerateAssistanceRequestIntakeSheetController extends Controller
{
    public function __construct(
        private readonly GenerateAssistanceRequestIntakeSheetAction $generate,
        private readonly AssistanceRequestIntakeSheetPdf $pdf,
    ) {}

    public function __invoke(
        GenerateAssistanceRequestIntakeSheetRequest $request,
        string $municipality,
        string $assistanceRequestId,
    ): Response|JsonResponse {
        try {
            $dto = GenerateAssistanceRequestIntakeSheetDto::fromRequest(
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
                'message' => 'The request intake sheet could not be generated. Please review the form and try again.',
            ], 500);
        }
    }
}
