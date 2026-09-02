<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\AssistanceFinancialDocumentContext;
use App\Core\ActionCenter\Enums\AssistanceGeneratedDocument;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\Municipality\Models\Municipality;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Throwable;

class BuildAssistanceFinancialDocumentContextAction
{
    public function __construct(
        private readonly EnsureAssistanceGeneratedDocumentEnabledAction $ensureDocumentEnabled,
    ) {}

    public function execute(
        string $assistanceRequestId,
        string $municipalId,
        AssistanceGeneratedDocument $document,
    ): AssistanceFinancialDocumentContext {
        $request = AssistanceRequest::query()
            ->with(['assistanceType', 'snapshot'])
            ->whereKey($assistanceRequestId)
            ->firstOr(function () {
                throw new ModelNotFoundException('Assistance request not found.');
            });

        $this->assertEligible($request, $municipalId, $document);

        $municipality = Municipality::query()
            ->with('media')
            ->find($municipalId);

        return new AssistanceFinancialDocumentContext(
            assistanceRequestId: $request->id,
            transactionNumber: $request->transaction_number,
            municipalityName: $municipality?->name ?? 'Municipality',
            municipalCode: $municipality?->municipal_code,
            municipalityLogoDataUri: $this->municipalityLogoDataUri(
                $municipality?->getFirstMedia('logo'),
            ),
            payee: $this->payee($request),
            address: $this->address($request, $municipality?->name),
            barangay: $request->snapshot?->barangay ?? '',
            assistanceType: $request->assistanceType?->name ?? 'Assistance',
            assistanceTypeSlug: $request->assistanceType?->slug,
            approvedAmount: (float) $request->amount_approved,
            approvedYear: $request->approved_at?->year ?? now()->year,
            assistedPerson: $this->assistedPerson($request),
            submittedAt: $request->created_at,
            releasedAt: $request->released_at,
        );
    }

    private function assertEligible(
        AssistanceRequest $request,
        string $municipalId,
        AssistanceGeneratedDocument $document,
    ): void {
        $documentName = strtolower($document->label());

        if ($request->municipal_id !== $municipalId) {
            throw new AuthorizationException(sprintf(
                'You may only generate %s for your own municipality.',
                Str::plural($documentName),
            ));
        }

        $this->ensureDocumentEnabled->execute($request, $document);

        if (! in_array($request->status, [AssistanceStatus::Approved, AssistanceStatus::Released], true)) {
            throw new \DomainException(sprintf(
                '%s %s can only be generated for an approved or released assistance request.',
                $this->article($documentName),
                $documentName,
            ));
        }

        if ($request->amount_approved === null) {
            throw new \DomainException(sprintf(
                'An approved amount is required before generating %s %s.',
                strtolower($this->article($documentName)),
                $documentName,
            ));
        }

        if ($request->snapshot === null) {
            throw new \DomainException(sprintf(
                'The request snapshot is missing and the %s cannot be generated safely.',
                $documentName,
            ));
        }
    }

    private function article(string $documentName): string
    {
        return in_array(strtolower($documentName[0]), ['a', 'e', 'i', 'o', 'u'], true)
            ? 'An'
            : 'A';
    }

    private function payee(AssistanceRequest $request): string
    {
        $snapshot = $request->snapshot;

        return trim(implode(' ', array_filter([
            $snapshot?->first_name,
            $snapshot?->middle_name,
            $snapshot?->last_name,
            $snapshot?->suffix,
        ])));
    }

    private function address(AssistanceRequest $request, ?string $municipalityName): string
    {
        $snapshot = $request->snapshot;
        $barangay = $snapshot?->barangay
            ? 'Brgy. '.$snapshot->barangay
            : null;

        return implode(', ', array_filter([
            $snapshot?->street,
            $barangay,
            $municipalityName,
            'Marinduque',
        ]));
    }

    private function assistedPerson(AssistanceRequest $request): ?string
    {
        if ($request->relationship_to_beneficiary === null) {
            return null;
        }

        $name = trim(implode(' ', array_filter([
            $request->on_behalf_first_name,
            $request->on_behalf_middle_name,
            $request->on_behalf_last_name,
            $request->on_behalf_suffix,
        ])));

        return $name !== '' ? $name : null;
    }

    private function municipalityLogoDataUri(?Media $media): ?string
    {
        if ($media === null) {
            return null;
        }

        $conversionName = $media->hasGeneratedConversion('optimized_logo')
            ? 'optimized_logo'
            : '';
        $disk = $conversionName !== ''
            ? ($media->conversions_disk ?: $media->disk)
            : $media->disk;
        $mimeType = $conversionName !== '' ? 'image/webp' : $media->mime_type;

        try {
            $contents = Storage::disk($disk)->get(
                $media->getPathRelativeToRoot($conversionName),
            );
        } catch (Throwable) {
            return null;
        }

        return sprintf('data:%s;base64,%s', $mimeType, base64_encode($contents));
    }
}
