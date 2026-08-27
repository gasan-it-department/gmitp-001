<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Contracts\AssistanceRequestFormDefinitionProvider;
use App\Core\ActionCenter\Dto\Assistance\UpdateAssistanceRequestDto;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\UseCase\Shared\LockAssistanceRequestAction;
use App\Core\Users\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

/**
 * Admin correction of an in-flight request's description and documents.
 *
 * The request row is locked before checking its status, and the lock remains
 * held through media replacement. Approval and release use the same row-first
 * lock order, so whichever operation obtains the lock first completes before
 * the other operation checks the latest committed status.
 *
 * UploadedFile instances are moved by Spatie and cannot be safely replayed.
 * This transaction therefore is not retried automatically.
 */
class UpdateAssistanceRequestAction
{
    public function __construct(
        private readonly LockAssistanceRequestAction $lockRequest,
        private readonly AssistanceRequestFormDefinitionProvider $formDefinitions,
    ) {}

    public function execute(UpdateAssistanceRequestDto $dto): AssistanceRequest
    {
        [$request, $descriptionChanged, $dateOfDeathChanged, $replacedKeys] = DB::transaction(
            function () use ($dto): array {
                $request = $this->lockRequest->execute(
                    id: $dto->assistanceRequestId,
                    municipalId: $dto->municipalId,
                    with: ['media', 'assistanceType'],
                );

                // A concurrent approval/release that committed first is visible
                // here, after this action has acquired the same request-row lock.
                $this->ensureEditable($request);

                $definition = $this->formDefinitions->for(
                    $dto->municipalCode,
                    $request->assistanceType?->slug,
                );

                if ($definition->requiresDateOfDeath() && blank($dto->onBehalfDateOfDeath)) {
                    throw new \DomainException('Enter the deceased person\'s date of death.');
                }

                $descriptionChanged = $request->description !== $dto->description;
                $metadata = $request->metadata ?? [];
                $dateOfDeathChanged = false;

                if ($definition->requiresDateOfDeath()) {
                    $dateOfDeathChanged = data_get($metadata, 'on_behalf_date_of_death') !== $dto->onBehalfDateOfDeath;
                    $metadata['on_behalf_date_of_death'] = $dto->onBehalfDateOfDeath;
                    $metadata['recipient_id_exception'] = 'deceased';
                    unset($metadata['recipient_id_exception_reason']);
                }

                $request->update([
                    'description' => $dto->description,
                    'metadata' => $metadata !== [] ? $metadata : null,
                ]);

                // Storage I/O intentionally stays inside the lock window.
                $replacedKeys = $this->replaceDocuments($request, $dto->documents);

                return [$request, $descriptionChanged, $dateOfDeathChanged, $replacedKeys];
            },
        );

        $this->recordAudit($request, $dto, $descriptionChanged, $dateOfDeathChanged, $replacedKeys);

        return $request->fresh(['media']);
    }

    private function ensureEditable(AssistanceRequest $request): void
    {
        if ($request->status->isEditable()) {
            return;
        }

        throw new \DomainException(
            'This request can no longer be edited because it has already been '
            .$request->status->label().'. Use reject/cancel and re-file if a correction is needed.',
        );
    }

    /**
     * Store the new file before deleting the previous file for that slot. A
     * failed upload therefore leaves the previously accepted scan available.
     *
     * @param  array<string, UploadedFile>  $documents
     * @return array<int, string>
     */
    private function replaceDocuments(AssistanceRequest $request, array $documents): array
    {
        $replaced = [];

        foreach ($documents as $documentKey => $file) {
            if (! $file instanceof UploadedFile) {
                continue;
            }

            $existingMedia = $request->getMedia('documents')
                ->filter(fn ($media) => $media->getCustomProperty('document_key') === $documentKey);

            $request
                ->addMedia($file)
                ->usingFileName($this->safeFileName($file))
                ->withCustomProperties(['document_key' => $documentKey])
                ->toMediaCollection('documents');

            $existingMedia->each(fn ($media) => $media->delete());
            $replaced[] = (string) $documentKey;
        }

        return $replaced;
    }

    private function safeFileName(UploadedFile $file): string
    {
        $extension = $file->getClientOriginalExtension();
        $base = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $slug = preg_replace('/[^A-Za-z0-9_-]+/', '_', $base) ?: 'document';

        return $slug.($extension ? ".{$extension}" : '');
    }

    private function recordAudit(
        AssistanceRequest $request,
        UpdateAssistanceRequestDto $dto,
        bool $descriptionChanged,
        bool $dateOfDeathChanged,
        array $replacedKeys,
    ): void {
        $changed = [];

        if ($descriptionChanged) {
            $changed[] = 'description';
        }

        if ($dateOfDeathChanged) {
            $changed[] = 'date_of_death';
        }

        if ($replacedKeys !== []) {
            $changed[] = 'documents';
        }

        if ($changed === []) {
            return;
        }

        activity('assistance_request')
            ->performedOn($request)
            ->causedBy(User::find($dto->actingAdminId))
            ->withProperties([
                'municipal_id' => $dto->municipalId,
                'changed' => $changed,
                'replaced_documents' => $replacedKeys,
            ])
            ->log('Edited the request details');
    }
}
