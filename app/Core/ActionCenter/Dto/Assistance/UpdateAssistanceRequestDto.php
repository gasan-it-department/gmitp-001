<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use App\External\Api\Request\ActionCenter\UpdateAssistanceRequestRequest;
use Illuminate\Http\UploadedFile;

/**
 * Pure-primitives DTO for an ADMIN correction to an in-flight assistance
 * request. Carries only the content fields an admin may fix after filing:
 *
 *   • description — the stated reason / situation (free text, not uppercased)
 *   • documents   — replacement/added scans, keyed by ac_document_types.key
 *   • date of death — only for configured deceased-subject programs
 *
 * It deliberately does NOT carry — and the action never writes — the frozen
 * snapshot_* identity/income/address, amount_approved, transaction_number,
 * assistance_type_id, or status. Those are immutable COA evidence or are
 * changed only through their own dedicated transitions.
 */
readonly class UpdateAssistanceRequestDto
{
    /**
     * @param  array<string, UploadedFile>  $documents  keyed by ac_document_types.key
     */
    public function __construct(
        public string $assistanceRequestId,
        public string $municipalId,
        public ?string $municipalCode,
        public string $actingAdminId,
        public string $description,
        public ?string $onBehalfDateOfDeath,
        public array $documents = [],
    ) {
    }

    public static function fromRequest(
        UpdateAssistanceRequestRequest $request,
        string $assistanceRequestId,
        string $municipalId,
        ?string $municipalCode,
        string $actingAdminId,
    ): self {
        // Keep only real uploads, keyed by their document slot key.
        $documents = array_filter(
            (array) $request->file('documents', []),
            fn ($file) => $file instanceof UploadedFile,
        );

        return new self(
            assistanceRequestId: $assistanceRequestId,
            municipalId: $municipalId,
            municipalCode: $municipalCode,
            actingAdminId: $actingAdminId,
            description: trim($request->string('description')->toString()),
            onBehalfDateOfDeath: $request->input('on_behalf_date_of_death') ?: null,
            documents: $documents,
        );
    }
}
