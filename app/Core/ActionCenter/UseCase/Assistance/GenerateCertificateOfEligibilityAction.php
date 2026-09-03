<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Contracts\FinancialDocumentDefaultsProvider;
use App\Core\ActionCenter\Dto\Assistance\CertificateOfEligibilityData;
use App\Core\ActionCenter\Dto\Assistance\CertificateOfEligibilityFormData;
use App\Core\ActionCenter\Dto\Assistance\GenerateCertificateOfEligibilityDto;
use App\Core\ActionCenter\Enums\AssistanceGeneratedDocument;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Enums\CivilStatus;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\Municipality\Models\Municipality;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Throwable;

class GenerateCertificateOfEligibilityAction
{
    public function __construct(
        private readonly FinancialDocumentDefaultsProvider $defaults,
        private readonly EnsureAssistanceGeneratedDocumentEnabledAction $ensureDocumentEnabled,
    ) {}

    public function formData(
        string $assistanceRequestId,
        string $municipalId,
    ): CertificateOfEligibilityFormData {
        [$request, $municipality, $provinceName] = $this->loadContext(
            $assistanceRequestId,
            $municipalId,
        );
        $filer = $this->filer($request);

        return new CertificateOfEligibilityFormData(
            assistanceRequestId: $request->id,
            transactionNumber: $request->transaction_number,
            subjectName: $filer['name'],
            subjectBirthDate: $filer['birth_date']?->toDateString(),
            subjectCivilStatus: $filer['civil_status'],
            address: $this->address($request, $municipality, $provinceName),
            assistanceType: $request->assistanceType?->name ?? 'Assistance',
            recommendedDefaults: $this->defaults
                ->for($municipality?->municipal_code, $request->assistanceType?->slug)
                ->certificateOfEligibility(),
        );
    }

    public function execute(
        GenerateCertificateOfEligibilityDto $dto,
        string $generatedByUserName,
    ): CertificateOfEligibilityData {
        [$request, $municipality, $provinceName] = $this->loadContext(
            $dto->assistanceRequestId,
            $dto->municipalId,
        );
        $filer = $this->filer($request);

        return new CertificateOfEligibilityData(
            transactionNumber: $request->transaction_number,
            municipalityName: $municipality?->name ?? 'Municipality',
            provinceName: $provinceName,
            trunklinePhone: $municipality?->settings?->trunkline_phone,
            municipalityLogoDataUri: $this->municipalityLogoDataUri(
                $municipality?->getFirstMedia('logo'),
            ),
            subjectName: $filer['name'],
            subjectAgePhrase: $this->agePhrase($filer['birth_date'], $dto->intakeDate),
            subjectCivilStatus: $filer['civil_status'],
            address: $this->address($request, $municipality, $provinceName),
            assistanceType: $request->assistanceType?->name ?? 'Assistance',
            intakeDate: $dto->intakeDate,
            certifiedByName: $dto->certifiedByName,
            certifiedByPosition: $dto->certifiedByPosition,
            approvedByName: $dto->approvedByName,
            approvedByPosition: $dto->approvedByPosition,
            generatedByUserName: $generatedByUserName,
            generatedAt: CarbonImmutable::now(),
        );
    }

    /** @return array{0: AssistanceRequest, 1: ?Municipality, 2: ?string} */
    private function loadContext(
        string $assistanceRequestId,
        string $municipalId,
    ): array {
        $request = AssistanceRequest::query()
            ->with(['assistanceType', 'snapshot'])
            ->whereKey($assistanceRequestId)
            ->firstOr(function () {
                throw new ModelNotFoundException('Assistance request not found.');
            });

        if ($request->municipal_id !== $municipalId) {
            throw new AuthorizationException(
                'You may only generate certificates for assistance requests in your own municipality.',
            );
        }

        $this->ensureDocumentEnabled->execute(
            $request,
            AssistanceGeneratedDocument::CertificateOfEligibility,
        );

        $underReview = $request->status === AssistanceStatus::UnderReview
            && $request->reviewed_at !== null;
        $completedReview = in_array(
            $request->status,
            [AssistanceStatus::Approved, AssistanceStatus::Released],
            true,
        );

        if (! $underReview && ! $completedReview) {
            throw new \DomainException(
                'A Certificate of Eligibility can only be generated after the case review has started.',
            );
        }

        if ($request->snapshot === null) {
            throw new \DomainException(
                'The request snapshot is missing and the certificate cannot be generated safely.',
            );
        }

        $municipality = Municipality::query()
            ->with(['media', 'settings'])
            ->find($municipalId);

        return [
            $request,
            $municipality,
            $this->provinceName($municipality),
        ];
    }

    /** @return array{name: string, birth_date: ?CarbonImmutable, civil_status: ?string} */
    private function filer(AssistanceRequest $request): array
    {
        $snapshot = $request->snapshot;
        $name = trim(implode(' ', array_filter([
            $snapshot->first_name,
            $snapshot->middle_name,
            $snapshot->last_name,
            $snapshot->suffix,
        ])));

        if ($name === '') {
            throw new \DomainException(
                'The filer snapshot is incomplete and the certificate cannot be generated safely.',
            );
        }

        return [
            'name' => $name,
            'birth_date' => $snapshot->birth_date
                ? CarbonImmutable::instance($snapshot->birth_date)
                : null,
            'civil_status' => $this->civilStatusLabel($snapshot->civil_status),
        ];
    }

    private function address(
        AssistanceRequest $request,
        ?Municipality $municipality,
        ?string $provinceName,
    ): string {
        $snapshot = $request->snapshot;

        return implode(', ', array_filter([
            $snapshot?->street,
            $snapshot?->barangay ? 'Brgy. '.$snapshot->barangay : null,
            $municipality?->name,
            $provinceName,
        ])) ?: 'Address not recorded';
    }

    private function agePhrase(?CarbonImmutable $birthDate, CarbonImmutable $intakeDate): ?string
    {
        if ($birthDate === null) {
            return null;
        }

        return $birthDate->diffInYears($intakeDate) >= 18
            ? 'of legal age'
            : 'a minor';
    }

    private function civilStatusLabel(mixed $value): ?string
    {
        if ($value instanceof CivilStatus) {
            return $value->label();
        }

        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        return CivilStatus::tryFrom(strtolower(trim($value)))?->label()
            ?? Str::headline($value);
    }

    private function provinceName(?Municipality $municipality): ?string
    {
        if ($municipality?->psgc_municipal_id === null) {
            return null;
        }

        return DB::table('psgc_municipalities')
            ->join(
                'psgc_provinces',
                'psgc_provinces.id',
                '=',
                'psgc_municipalities.province_id',
            )
            ->where('psgc_municipalities.id', $municipality->psgc_municipal_id)
            ->value('psgc_provinces.name');
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
