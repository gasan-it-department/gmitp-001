<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Dto\Beneficiary\BeneficiaryIdentityDocumentEvidence;
use App\Core\ActionCenter\Dto\Beneficiary\BeneficiaryIdentityDocumentSheetData;
use App\Core\ActionCenter\Models\Beneficiary;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Storage;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Throwable;

class GenerateBeneficiaryIdentityDocumentSheetAction
{
    public function execute(
        string $beneficiaryId,
        string $municipalId,
        ?string $municipalityName,
        string $generatedByUserName,
    ): BeneficiaryIdentityDocumentSheetData {
        $beneficiary = Beneficiary::query()
            ->with(['household', 'identityVerifier', 'intakeRejector', 'media'])
            ->whereKey($beneficiaryId)
            ->firstOr(function () {
                throw new ModelNotFoundException('Beneficiary not found.');
            });

        if ($beneficiary->household?->municipal_id !== $municipalId) {
            throw new AuthorizationException(
                'You may only print identity document sheets for beneficiaries in your own municipality.',
            );
        }

        return new BeneficiaryIdentityDocumentSheetData(
            beneficiary: $beneficiary,
            municipalityName: $municipalityName,
            generatedByUserName: $generatedByUserName,
            generatedAt: now(),
            frontDocument: $this->documentEvidence(
                media: $beneficiary->getFirstMedia('identity_id_front'),
                side: 'front',
                label: 'ID Front',
                missingMessage: 'Front ID not provided.',
            ),
            backDocument: $this->documentEvidence(
                media: $beneficiary->getFirstMedia('identity_id_back'),
                side: 'back',
                label: 'ID Back',
                missingMessage: 'Back ID not provided.',
            ),
        );
    }

    private function documentEvidence(
        ?Media $media,
        string $side,
        string $label,
        string $missingMessage,
    ): BeneficiaryIdentityDocumentEvidence {
        if ($media === null) {
            return new BeneficiaryIdentityDocumentEvidence(
                side: $side,
                label: $label,
                status: 'missing',
                dataUri: null,
                fileName: null,
                mimeType: null,
                size: null,
                message: $missingMessage,
            );
        }

        if (! in_array($media->mime_type, ['image/jpeg', 'image/png'], true)) {
            return new BeneficiaryIdentityDocumentEvidence(
                side: $side,
                label: $label,
                status: 'pdf',
                dataUri: null,
                fileName: $media->file_name,
                mimeType: $media->mime_type,
                size: $media->human_readable_size,
                message: 'PDF identity document on file. View through the uploaded ID link in the beneficiary profile.',
            );
        }

        $conversion = $media->hasGeneratedConversion(Beneficiary::IDENTITY_DISPLAY_CONVERSION)
            ? Beneficiary::IDENTITY_DISPLAY_CONVERSION
            : '';
        $disk = $conversion !== ''
            ? ($media->conversions_disk ?: $media->disk)
            : $media->disk;
        $mimeType = $conversion !== '' ? 'image/webp' : $media->mime_type;

        try {
            $contents = Storage::disk($disk)->get(
                $media->getPathRelativeToRoot($conversion),
            );
        } catch (Throwable) {
            return new BeneficiaryIdentityDocumentEvidence(
                side: $side,
                label: $label,
                status: 'unavailable',
                dataUri: null,
                fileName: $media->file_name,
                mimeType: $media->mime_type,
                size: $media->human_readable_size,
                message: 'The uploaded image could not be embedded in this print sheet. View the uploaded ID link instead.',
            );
        }

        return new BeneficiaryIdentityDocumentEvidence(
            side: $side,
            label: $label,
            status: 'image',
            dataUri: sprintf('data:%s;base64,%s', $mimeType, base64_encode($contents)),
            fileName: $media->file_name,
            mimeType: $mimeType,
            size: $media->human_readable_size,
            message: null,
        );
    }
}
