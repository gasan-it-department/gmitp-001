<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\AssistanceRequestIntakeSheetData;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\Municipality\Models\Municipality;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Throwable;

class GenerateAssistanceRequestIntakeSheetAction
{
    public function execute(
        string $assistanceRequestId,
        string $municipalId,
        string $generatedByUserName,
    ): AssistanceRequestIntakeSheetData {
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

        $municipality = Municipality::query()
            ->with('media')
            ->find($municipalId);

        return new AssistanceRequestIntakeSheetData(
            request: $request,
            householdMembers: $this->loadCurrentHouseholdMembers($request->household_id),
            municipalityName: $municipality?->name,
            municipalityLogoDataUri: $this->municipalityLogoDataUri(
                $municipality?->getFirstMedia('logo'),
            ),
            generatedByUserName: $generatedByUserName,
            generatedAt: now(),
        );
    }

    /**
     * The request's claimant/address fields are frozen in the snapshot table.
     * Household composition is intentionally read live because member rows are
     * not snapshotted per request yet.
     *
     * @return Collection<int, HouseholdMember>
     */
    private function loadCurrentHouseholdMembers(string $householdId): Collection
    {
        return HouseholdMember::query()
            ->where('household_id', $householdId)
            ->where('is_active', true)
            ->orderByRaw("CASE WHEN relationship = 'head' THEN 0 ELSE 1 END")
            ->orderBy('created_at')
            ->get();
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
