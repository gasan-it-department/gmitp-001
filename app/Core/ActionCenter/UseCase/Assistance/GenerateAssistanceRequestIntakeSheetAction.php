<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\AssistanceRequestHouseholdMemberData;
use App\Core\ActionCenter\Dto\Assistance\AssistanceRequestIntakeSheetData;
use App\Core\ActionCenter\Dto\Assistance\AssistanceRequestIntakeSheetFormData;
use App\Core\ActionCenter\Dto\Assistance\GenerateAssistanceRequestIntakeSheetDto;
use App\Core\ActionCenter\Enums\AssistanceIntakeProblem;
use App\Core\ActionCenter\Enums\CivilStatus;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\Municipality\Models\Municipality;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Throwable;

class GenerateAssistanceRequestIntakeSheetAction
{
    public function formData(
        string $assistanceRequestId,
        string $municipalId,
    ): AssistanceRequestIntakeSheetFormData {
        [$request, , $householdComposition] = $this->loadContext(
            $assistanceRequestId,
            $municipalId,
        );
        $snapshot = $request->snapshot;
        $frozenEconomicValues = [
            'source_of_income' => $this->presentOccupation($snapshot?->occupation),
            'monthly_income' => $this->presentIncome($snapshot?->monthly_income),
        ];
        $currentEconomicValues = [
            'source_of_income' => $this->presentOccupation($request->beneficiary?->occupation),
            'monthly_income' => $this->presentIncome($request->beneficiary?->monthly_income),
        ];

        return new AssistanceRequestIntakeSheetFormData(
            assistanceRequestId: $request->id,
            transactionNumber: $request->transaction_number,
            claimantName: $this->claimantName($request),
            ageAtFiling: $snapshot?->birth_date && $request->created_at
            ? (int) $snapshot->birth_date->diffInYears($request->created_at)
            : null,
            civilStatus: $this->civilStatusLabel($snapshot?->civil_status),
            barangay: $snapshot?->barangay,
            assistanceType: $request->assistanceType?->name ?? 'Assistance',
            filingSubject: $this->filingSubject($request),
            problemOptions: AssistanceIntakeProblem::options(),
            frozenEconomicValues: $frozenEconomicValues,
            currentEconomicValues: $currentEconomicValues,
            householdComposition: [
                'source' => $householdComposition['uses_current_fallback']
                    ? 'current_household_fallback'
                    : 'request_snapshot',
                'captured_at' => $householdComposition['captured_at']?->toIso8601String(),
                'member_count' => $this->printableHouseholdMembers(
                    $householdComposition['members'],
                    $request,
                )->count(),
                'warning' => $householdComposition['uses_current_fallback']
                    ? 'This legacy request has no request-time household snapshot. Section V will use the household members currently recorded in the beneficiary profile.'
                    : null,
            ],
            recommendedDefaults: [
                'problem_presented' => $this->recommendedProblems($request),
                'source_of_income' => $frozenEconomicValues['source_of_income']
                    ?? $currentEconomicValues['source_of_income'],
                'monthly_income' => $frozenEconomicValues['monthly_income']
                    ?? $currentEconomicValues['monthly_income'],
                'recommendation' => $request->assistanceType?->name ?? 'Assistance',
            ],
        );
    }

    public function execute(
        GenerateAssistanceRequestIntakeSheetDto $dto,
        string $generatedByUserName,
    ): AssistanceRequestIntakeSheetData {
        [$request, $municipality, $householdComposition] = $this->loadContext(
            $dto->assistanceRequestId,
            $dto->municipalId,
        );

        return new AssistanceRequestIntakeSheetData(
            request: $request,
            householdMembers: $householdComposition['members'],
            householdCompositionCapturedAt: $householdComposition['captured_at'],
            usesCurrentHouseholdFallback: $householdComposition['uses_current_fallback'],
            municipalityName: $municipality?->name,
            municipalityLogoDataUri: $this->municipalityLogoDataUri(
                $municipality?->getFirstMedia('logo'),
            ),
            problemPresented: $dto->problemPresented,
            sourceOfIncome: $dto->sourceOfIncome,
            monthlyIncome: $dto->monthlyIncome,
            recommendation: $dto->recommendation,
            generatedByUserName: $generatedByUserName,
            generatedAt: CarbonImmutable::now(),
        );
    }

    /**
     * @return array{
     *     0: AssistanceRequest,
     *     1: ?Municipality,
     *     2: array{
     *         members: Collection<int, AssistanceRequestHouseholdMemberData>,
     *         captured_at: ?CarbonImmutable,
     *         uses_current_fallback: bool
     *     }
     * }
     */
    private function loadContext(
        string $assistanceRequestId,
        string $municipalId,
    ): array {
        $request = AssistanceRequest::query()
            ->with([
                'assistanceType',
                'beneficiary',
                'snapshot',
                'onBehalfHouseholdMember',
            ])
            ->whereKey($assistanceRequestId)
            ->firstOr(function () {
                throw new ModelNotFoundException('Assistance request not found.');
            });

        if ($request->municipal_id !== $municipalId) {
            throw new AuthorizationException(
                'You may only generate intake sheets for assistance requests in your own municipality.',
            );
        }

        if ($request->snapshot === null) {
            throw new \DomainException(
                'The request snapshot is missing and the intake sheet cannot be generated safely.',
            );
        }

        $municipality = Municipality::query()
            ->with('media')
            ->find($municipalId);

        return [
            $request,
            $municipality,
            $this->resolveHouseholdComposition($request),
        ];
    }

    private function claimantName(AssistanceRequest $request): string
    {
        $snapshot = $request->snapshot;
        $name = trim(implode(' ', array_filter([
            $snapshot?->first_name,
            $snapshot?->middle_name,
            $snapshot?->last_name,
            $snapshot?->suffix,
        ])));

        if ($name === '') {
            throw new \DomainException(
                'The claimant snapshot is incomplete and the intake sheet cannot be generated safely.',
            );
        }

        return $name;
    }

    private function filingSubject(AssistanceRequest $request): string
    {
        if ($request->relationship_to_beneficiary === null) {
            return 'self';
        }

        $name = trim(implode(' ', array_filter([
            $request->on_behalf_first_name,
            $request->on_behalf_middle_name,
            $request->on_behalf_last_name,
            $request->on_behalf_suffix,
        ])));

        return trim(strtolower($request->relationship_to_beneficiary->label()) . ($name ? ' ' . $name : ''));
    }

    /** @return list<string> */
    private function recommendedProblems(AssistanceRequest $request): array
    {
        $assistance = strtolower(trim(implode(' ', array_filter([
            $request->assistanceType?->name,
            $request->assistanceType?->slug,
        ]))));

        if (str_contains($assistance, 'burial') || str_contains($assistance, 'funeral')) {
            return [AssistanceIntakeProblem::HelplessToBuryDead->value];
        }

        if (str_contains($assistance, 'medical')) {
            return [AssistanceIntakeProblem::SeekingMedicalAssistance->value];
        }

        return [];
    }

    private function civilStatusLabel(mixed $value): ?string
    {
        if ($value instanceof CivilStatus) {
            return $value->label();
        }

        if (!is_string($value) || trim($value) === '') {
            return null;
        }

        return CivilStatus::tryFrom(strtolower(trim($value)))?->label()
            ?? Str::headline($value);
    }

    private function presentOccupation(mixed $value): ?string
    {
        if (!is_string($value) || trim($value) === '') {
            return null;
        }

        return trim($value);
    }

    private function presentIncome(mixed $value): ?float
    {
        return $value === null ? null : (float) $value;
    }

    /**
     * New requests use the request-time metadata snapshot. Legacy requests
     * fall back to the current active roster and are explicitly identified to
     * the admin and in the generated Section V heading.
     *
     * @return array{
     *     members: Collection<int, AssistanceRequestHouseholdMemberData>,
     *     captured_at: ?CarbonImmutable,
     *     uses_current_fallback: bool
     * }
     */
    private function resolveHouseholdComposition(AssistanceRequest $request): array
    {
        $snapshot = data_get($request->metadata, 'household_composition_snapshot');

        if (is_array($snapshot)
            && array_key_exists('members', $snapshot)
            && is_array($snapshot['members'])) {
            $members = collect($snapshot['members'])
                ->filter(fn (mixed $member): bool => is_array($member))
                ->map(
                    fn (array $member): AssistanceRequestHouseholdMemberData => AssistanceRequestHouseholdMemberData::fromSnapshot(
                        $member,
                    ),
                )
                ->filter(
                    fn (AssistanceRequestHouseholdMemberData $member): bool => $member->fullName !== '',
                )
                ->values();

            return [
                'members' => $members,
                'captured_at' => $this->parseCapturedAt($snapshot['captured_at'] ?? null),
                'uses_current_fallback' => false,
            ];
        }

        $capturedAt = CarbonImmutable::now();
        $members = HouseholdMember::query()
            ->where('household_id', $request->household_id)
            ->where('is_active', true)
            ->orderByRaw("CASE WHEN relationship = 'head' THEN 0 ELSE 1 END")
            ->orderBy('created_at')
            ->get()
            ->map(
                fn (HouseholdMember $member): AssistanceRequestHouseholdMemberData => AssistanceRequestHouseholdMemberData::fromModel(
                    $member,
                    $capturedAt,
                ),
            )
            ->values();

        return [
            'members' => $members,
            'captured_at' => null,
            'uses_current_fallback' => true,
        ];
    }

    /** @param Collection<int, AssistanceRequestHouseholdMemberData> $members */
    private function printableHouseholdMembers(
        Collection $members,
        AssistanceRequest $request,
    ): Collection {
        return $members
            ->reject(
                fn (AssistanceRequestHouseholdMemberData $member): bool => $member->beneficiaryId !== null
                    && $member->beneficiaryId === (string) $request->beneficiary_id,
            )
            ->values();
    }

    private function parseCapturedAt(mixed $value): ?CarbonImmutable
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        try {
            return CarbonImmutable::parse($value);
        } catch (Throwable) {
            return null;
        }
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
