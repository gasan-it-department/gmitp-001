<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\GenerateObligationRequestDto;
use App\Core\ActionCenter\Dto\Assistance\ObligationRequestData;
use App\Core\ActionCenter\Dto\Assistance\ObligationRequestFormData;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\Municipality\Models\Municipality;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Storage;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Throwable;

class GenerateObligationRequestAction
{
    public function formData(
        string $assistanceRequestId,
        string $municipalId,
    ): ObligationRequestFormData {
        $request = $this->loadEligibleRequest($assistanceRequestId, $municipalId);
        $municipality = Municipality::query()->find($municipalId);

        return new ObligationRequestFormData(
            assistanceRequestId: $request->id,
            transactionNumber: $request->transaction_number,
            payee: $this->payee($request),
            address: $this->address($request, $municipality?->name),
            assistanceType: $request->assistanceType?->name ?? 'Assistance',
            approvedAmount: (float) $request->amount_approved,
            suggestedParticulars: $this->suggestedParticulars($request),
        );
    }

    public function execute(
        GenerateObligationRequestDto $dto,
        string $generatedByUserName,
    ): ObligationRequestData {
        $request = $this->loadEligibleRequest(
            $dto->assistanceRequestId,
            $dto->municipalId,
        );
        $municipality = Municipality::query()
            ->with('media')
            ->find($dto->municipalId);

        return new ObligationRequestData(
            transactionNumber: $request->transaction_number,
            municipalityName: $municipality?->name ?? 'Municipality',
            municipalityLogoDataUri: $this->municipalityLogoDataUri(
                $municipality?->getFirstMedia('logo'),
            ),
            payee: $this->payee($request),
            address: $this->address($request, $municipality?->name),
            assistanceType: $request->assistanceType?->name ?? 'Assistance',
            approvedAmount: (float) $request->amount_approved,
            obligationRequestNumber: $dto->obligationRequestNumber,
            responsibilityCenter: $dto->responsibilityCenter,
            accountCode: $dto->accountCode,
            particulars: $dto->particulars,
            mswdoPrintedName: $dto->mswdoPrintedName,
            mswdoPosition: $dto->mswdoPosition,
            budgetOfficerPrintedName: $dto->budgetOfficerPrintedName,
            budgetOfficerPosition: $dto->budgetOfficerPosition,
            office: $dto->office,
            fpp: $dto->fpp,
            generatedByUserName: $generatedByUserName,
            generatedAt: now(),
        );
    }

    private function loadEligibleRequest(
        string $assistanceRequestId,
        string $municipalId,
    ): AssistanceRequest {
        $request = AssistanceRequest::query()
            ->with(['assistanceType', 'snapshot'])
            ->whereKey($assistanceRequestId)
            ->firstOr(function () {
                throw new ModelNotFoundException('Assistance request not found.');
            });

        if ($request->municipal_id !== $municipalId) {
            throw new AuthorizationException(
                'You may only generate obligation requests for your own municipality.',
            );
        }

        if (! in_array($request->status, [AssistanceStatus::Approved, AssistanceStatus::Released], true)) {
            throw new \DomainException(
                'An obligation request can only be generated for an approved or released assistance request.',
            );
        }

        if ($request->amount_approved === null) {
            throw new \DomainException(
                'An approved amount is required before generating an obligation request.',
            );
        }

        if ($request->snapshot === null) {
            throw new \DomainException(
                'The request snapshot is missing and the obligation request cannot be generated safely.',
            );
        }

        return $request;
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

    private function suggestedParticulars(AssistanceRequest $request): string
    {
        $assistanceType = $request->assistanceType?->name ?? 'Assistance';
        $approvedYear = $request->approved_at?->year ?? now()->year;
        $lines = [
            'Payment for '.$assistanceType,
        ];

        if ($request->relationship_to_beneficiary !== null) {
            $assistedPerson = trim(implode(' ', array_filter([
                $request->on_behalf_first_name,
                $request->on_behalf_middle_name,
                $request->on_behalf_last_name,
                $request->on_behalf_suffix,
            ])));

            if ($assistedPerson !== '') {
                $lines[] = 'For: '.$assistedPerson;
            }
        }

        $lines[] = 'RE: Aid/Assistance to Individual in Crisis';
        $lines[] = sprintf('Situation (AICS) CY %d', $approvedYear);

        return implode("\n", $lines);
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
