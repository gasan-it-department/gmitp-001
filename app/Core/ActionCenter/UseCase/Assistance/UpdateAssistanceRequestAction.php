<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\UpdateAssistanceRequestDto;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\Users\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

/**
 * Admin correction of an in-flight assistance request's CONTENT — the
 * description and supporting-document scans. Admin-only, status-gated.
 *
 * ── Why status-gated, not free editing ─────────────────────────────────────
 * ac_assistance_requests is COA evidence: snapshot_* identity/income/address
 * are frozen, amount_approved is bound on approval, and release is immutable.
 * So editing is allowed ONLY while the request is still undecided (pending /
 * under_review — AssistanceStatus::isEditable()). After that the record is
 * content-locked; corrections go through reject/cancel + re-file.
 *
 * Never touched here: snapshot_*, amount_approved, transaction_number,
 * assistance_type_id, status. Identity fixes belong to the beneficiary-profile
 * editor; the request keeps its frozen snapshot on purpose.
 *
 * Mirrors StoreAssistanceRequestAction: the row write is in a tight transaction
 * (`attempts: 3`); media I/O runs OUTSIDE it so a multi-MB upload never holds a
 * row lock. Audited with one explicit activity entry on the request's trail.
 */
class UpdateAssistanceRequestAction
{
    public function execute(UpdateAssistanceRequestDto $dto): AssistanceRequest
    {
        $request = AssistanceRequest::with('media')->findOrFail($dto->assistanceRequestId);

        // Tenant guard — municipal_id lives directly on the request.
        if ($request->municipal_id !== $dto->municipalId) {
            throw new AuthorizationException(
                'You may only edit assistance requests from your own municipality.',
            );
        }

        // Lifecycle gate — only in-flight requests are editable.
        if (! $request->status->isEditable()) {
            throw new \DomainException(
                'This request can no longer be edited because it has already been '
                . $request->status->label() . '. Use reject/cancel and re-file if a correction is needed.',
            );
        }

        $descriptionChanged = $request->description !== $dto->description;

        DB::transaction(function () use ($request, $dto) {
            $request->update(['description' => $dto->description]);
        }, attempts: 3);

        // Media replace runs OUTSIDE the transaction (disk I/O). For each slot
        // that received a new file, drop the existing scan(s) for that
        // document_key and attach the replacement — untouched slots are left
        // exactly as they were.
        $replacedKeys = $this->replaceDocuments($request, $dto->documents);

        $this->recordAudit($request, $dto, $descriptionChanged, $replacedKeys);

        return $request->fresh(['media']);
    }

    /**
     * Replace/add documents by slot key. Returns the keys that were changed
     * (for the audit entry).
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

            // Remove the previous scan(s) filed under this slot.
            $request->getMedia('documents')
                ->filter(fn ($media) => $media->getCustomProperty('document_key') === $documentKey)
                ->each(fn ($media) => $media->delete());

            $request
                ->addMedia($file)
                ->usingFileName($this->safeFileName($file))
                ->withCustomProperties(['document_key' => $documentKey])
                ->toMediaCollection('documents');

            $replaced[] = (string) $documentKey;
        }

        return $replaced;
    }

    /**
     * Sanitise the on-disk filename (mirrors StoreAssistanceRequestAction).
     */
    private function safeFileName(UploadedFile $file): string
    {
        $extension = $file->getClientOriginalExtension();
        $base = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $slug = preg_replace('/[^A-Za-z0-9_-]+/', '_', $base) ?: 'document';

        return $slug . ($extension ? ".{$extension}" : '');
    }

    /**
     * One explicit audit entry on THIS request's trail. `description` is not in
     * the model's LogsActivity::logOnly() set and media changes aren't captured
     * by it at all, so this is the record of an admin edit (who / when / what).
     */
    private function recordAudit(
        AssistanceRequest $request,
        UpdateAssistanceRequestDto $dto,
        bool $descriptionChanged,
        array $replacedKeys,
    ): void {
        $changed = [];
        if ($descriptionChanged) {
            $changed[] = 'description';
        }
        if ($replacedKeys !== []) {
            $changed[] = 'documents';
        }

        // Nothing actually changed — don't write a noise row.
        if ($changed === []) {
            return;
        }

        activity('assistance_request')
            ->performedOn($request)
            ->causedBy(User::find($dto->actingAdminId))
            ->withProperties([
                'municipal_id'       => $dto->municipalId,
                'changed'            => $changed,
                'replaced_documents' => $replacedKeys,
            ])
            ->log('Edited the request details');
    }
}
