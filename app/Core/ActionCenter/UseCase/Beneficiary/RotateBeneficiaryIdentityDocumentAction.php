<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\Users\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use Spatie\MediaLibrary\Conversions\FileManipulator;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Throwable;

class RotateBeneficiaryIdentityDocumentAction
{
    public function __construct(
        private readonly FileManipulator $fileManipulator,
    ) {}

    public function execute(
        string $beneficiaryId,
        string $side,
        string $direction,
        string $municipalId,
        ?string $actingAdminId = null,
    ): Beneficiary {
        $collection = match ($side) {
            'front' => 'identity_id_front',
            'back' => 'identity_id_back',
            default => throw new InvalidArgumentException('Invalid identity document side.'),
        };
        $rotationDelta = match ($direction) {
            'left' => -90,
            'right' => 90,
            default => throw new InvalidArgumentException('Invalid rotation direction.'),
        };

        $beneficiary = Beneficiary::query()
            ->with(['household:id,municipal_id', 'media'])
            ->whereKey($beneficiaryId)
            ->firstOrFail();

        if ($beneficiary->household?->municipal_id !== $municipalId) {
            throw new AuthorizationException('You may only edit beneficiaries from your own municipality.');
        }

        $media = $beneficiary->getFirstMedia($collection);

        if ($media === null) {
            throw new \DomainException('The selected identity document has not been uploaded.');
        }

        if (! in_array($media->mime_type, ['image/jpeg', 'image/png'], true)) {
            throw new \DomainException('PDF identity documents cannot be rotated here. Replace the PDF with an upright image if needed.');
        }

        [$previousRotation, $newRotation] = DB::transaction(function () use ($media, $rotationDelta): array {
            $lockedMedia = Media::query()
                ->whereKey($media->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            $previousRotation = $this->normalizeRotation(
                (int) $lockedMedia->getCustomProperty('display_rotation', 0),
            );
            $newRotation = $this->normalizeRotation($previousRotation + $rotationDelta);

            $lockedMedia->setCustomProperty('display_rotation', $newRotation);
            $lockedMedia->save();

            try {
                $this->fileManipulator->createDerivedFiles(
                    $lockedMedia,
                    [Beneficiary::IDENTITY_DISPLAY_CONVERSION],
                );
            } catch (Throwable $exception) {
                report($exception);

                throw new \DomainException('The ID orientation could not be saved. Please try again.');
            }

            return [$previousRotation, $newRotation];
        });

        $logger = activity('beneficiary')
            ->performedOn($beneficiary)
            ->withProperties([
                'side' => $side,
                'direction' => $direction,
                'previous_rotation' => $previousRotation,
                'display_rotation' => $newRotation,
                'municipal_id' => $municipalId,
            ]);

        if ($actingAdminId !== null) {
            $logger->causedBy(User::find($actingAdminId));
        }

        $logger->log('Rotated beneficiary identity document display');

        return $beneficiary->fresh(['media']);
    }

    private function normalizeRotation(int $rotation): int
    {
        return (($rotation % 360) + 360) % 360;
    }
}
