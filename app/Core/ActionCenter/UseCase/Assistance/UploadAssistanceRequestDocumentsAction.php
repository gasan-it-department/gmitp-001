<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\UploadAssistanceRequestDocumentsDto;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\AssistanceRequestDocumentCheck;
use App\Core\ActionCenter\Services\AssistanceMswdVerificationService;
use App\Core\ActionCenter\UseCase\Shared\LockAssistanceRequestAction;
use App\Core\Users\Enums\EnumPermissions;
use App\Core\Users\Enums\EnumRoles;
use App\Core\Users\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

/** Upload or replace evidence without unlocking approved identity/amount fields. */
class UploadAssistanceRequestDocumentsAction
{
    public function __construct(
        private readonly LockAssistanceRequestAction $lockRequest,
        private readonly AssistanceMswdVerificationService $verification,
    ) {}

    public function execute(UploadAssistanceRequestDocumentsDto $dto): AssistanceRequest
    {
        $this->assertUploaderCanAct($dto->actorId, $dto->municipalId);

        return DB::transaction(function () use ($dto): AssistanceRequest {
            $request = $this->lockRequest->execute(
                id: $dto->assistanceRequestId,
                municipalId: $dto->municipalId,
                with: ['media', 'documentChecks'],
            );
            $this->verification->captureRequirements($request);
            $request->load('documentChecks');

            if (! $this->verification->canContinueAssessment($request)) {
                throw new \DomainException('Supporting documents can only be changed before MSWD verification is completed and before release.');
            }

            $replaced = [];
            foreach ($dto->documents as $key => $file) {
                if (! $file instanceof UploadedFile) {
                    continue;
                }
                $check = $request->documentChecks->firstWhere('document_key', $key);
                if (! $check instanceof AssistanceRequestDocumentCheck || ! $check->is_applicable) {
                    throw new \DomainException('One of the uploaded files does not belong to an applicable frozen document requirement.');
                }

                $existing = $request->getMedia('documents')
                    ->filter(fn ($media) => $media->getCustomProperty('document_key') === $key);

                // Storage comes first. If it fails, the old version is still
                // present and remains auditable/usable for correction.
                $request
                    ->addMedia($file)
                    ->usingFileName($this->safeFileName($file))
                    ->withCustomProperties(['document_key' => $key])
                    ->toMediaCollection('documents');

                $existing->each(fn ($media) => $media->delete());
                $this->verification->resetCheckForReplacement($request, (string) $key);
                $replaced[] = (string) $key;
            }

            if ($replaced === []) {
                throw new \DomainException('Choose at least one supporting document to upload.');
            }

            activity('assistance_request')
                ->performedOn($request)
                ->causedBy(User::find($dto->actorId))
                ->withProperties([
                    'municipal_id' => $dto->municipalId,
                    'replaced_documents' => $replaced,
                ])
                ->log('Uploaded supporting documents for MSWD verification');

            return $request->fresh(['media', 'documentChecks.checkedBy']);
        });
    }

    private function assertUploaderCanAct(string $actorId, string $municipalId): void
    {
        $actor = User::query()->whereKey($actorId)->first();
        if (! $actor || ($actor->municipal_id !== $municipalId && ! $actor->hasRole(EnumRoles::SUPER_ADMIN->value)) || ! (
            $actor->can(EnumPermissions::ACTION_CENTER_REQUESTS_INTAKE->value)
            || $actor->can(EnumPermissions::ACTION_CENTER_REQUESTS_PROCESS->value)
        )) {
            throw new AuthorizationException('You are not authorized to upload supporting request documents.');
        }
    }

    private function safeFileName(UploadedFile $file): string
    {
        $extension = $file->getClientOriginalExtension();
        $base = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $slug = preg_replace('/[^A-Za-z0-9_-]+/', '_', $base) ?: 'document';

        return $slug.($extension ? ".{$extension}" : '');
    }
}
