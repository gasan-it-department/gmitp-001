<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\ReplaceAssistanceAdditionalDocumentDto;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Services\AssistanceMswdVerificationService;
use App\Core\ActionCenter\UseCase\Shared\LockAssistanceRequestAction;
use App\Core\Users\Enums\EnumPermissions;
use App\Core\Users\Enums\EnumRoles;
use App\Core\Users\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/** Replace one non-checklist attachment without reopening approved request data. */
class ReplaceAssistanceAdditionalDocumentAction
{
    private const IDENTITY_DOCUMENT_KEYS = [
        'valid_id_front',
        'valid_id_back',
        'recipient_valid_id_front',
        'recipient_valid_id_back',
    ];

    public function __construct(
        private readonly LockAssistanceRequestAction $lockRequest,
        private readonly AssistanceMswdVerificationService $verification,
    ) {}

    public function execute(ReplaceAssistanceAdditionalDocumentDto $dto): AssistanceRequest
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

            $existing = $request->media->first(
                fn (Media $media): bool => $media->collection_name === 'documents' && (int) $media->getKey() === $dto->mediaId,
            );

            if (! $existing instanceof Media) {
                throw new \DomainException('The selected supporting document does not belong to this assistance request.');
            }

            $documentKey = trim((string) $existing->getCustomProperty('document_key'));
            if ($documentKey === '') {
                throw new \DomainException('This legacy attachment has no document key and cannot be replaced safely.');
            }

            if ($request->documentChecks->contains('document_key', $documentKey)) {
                throw new \DomainException('Use the MSWD document checklist uploader to replace this file.');
            }

            if (in_array($documentKey, self::IDENTITY_DOCUMENT_KEYS, true)) {
                throw new \DomainException('Replace identity evidence through the beneficiary identity workflow so its verification is reset correctly.');
            }

            $newMedia = $request
                ->addMedia($dto->document)
                ->usingFileName($this->safeFileName($dto->document))
                ->withCustomProperties($existing->custom_properties ?? ['document_key' => $documentKey])
                ->toMediaCollection('documents');

            $oldMedia = [
                'id' => $existing->id,
                'uuid' => $existing->uuid,
                'file_name' => $existing->file_name,
                'mime_type' => $existing->mime_type,
                'size' => (int) $existing->size,
            ];
            $newMediaDetails = [
                'id' => $newMedia->id,
                'uuid' => $newMedia->uuid,
                'file_name' => $newMedia->file_name,
                'mime_type' => $newMedia->mime_type,
                'size' => (int) $newMedia->size,
            ];

            // The replacement is safely stored before the previous file is removed.
            $existing->delete();

            activity('assistance_request')
                ->performedOn($request)
                ->causedBy(User::find($dto->actorId))
                ->withProperties([
                    'municipal_id' => $dto->municipalId,
                    'document_key' => $documentKey,
                    'old_media' => $oldMedia,
                    'new_media' => $newMediaDetails,
                    'replaced_by_user_id' => $dto->actorId,
                    'replaced_at' => now()->toIso8601String(),
                ])
                ->log('Replaced additional supporting document');

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
            throw new AuthorizationException('You are not authorized to replace supporting request documents.');
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
