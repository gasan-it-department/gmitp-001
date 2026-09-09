<?php

use App\Core\ActionCenter\Enums\PhysicalCopyRequirement;

it('exposes only concrete copy types as presented options', function () {
    expect(PhysicalCopyRequirement::presentedValues())->toBe([
        'original',
        'certified_true_copy',
        'photocopy',
    ])->and(PhysicalCopyRequirement::presentedOptions())->toBe([
        ['value' => 'original', 'label' => 'Original'],
        ['value' => 'certified_true_copy', 'label' => 'Certified True Copy'],
        ['value' => 'photocopy', 'label' => 'Photocopy'],
    ]);
});

it('determines whether a presented copy satisfies the requirement', function () {
    expect(PhysicalCopyRequirement::Unspecified->accepts(null))->toBeTrue()
        ->and(PhysicalCopyRequirement::Original->accepts(PhysicalCopyRequirement::Original))->toBeTrue()
        ->and(PhysicalCopyRequirement::Original->accepts(PhysicalCopyRequirement::Photocopy))->toBeFalse()
        ->and(PhysicalCopyRequirement::CertifiedTrueCopy->accepts(PhysicalCopyRequirement::CertifiedTrueCopy))->toBeTrue()
        ->and(PhysicalCopyRequirement::OriginalOrCertifiedTrueCopy->accepts(PhysicalCopyRequirement::Original))->toBeTrue()
        ->and(PhysicalCopyRequirement::OriginalOrCertifiedTrueCopy->accepts(PhysicalCopyRequirement::CertifiedTrueCopy))->toBeTrue()
        ->and(PhysicalCopyRequirement::OriginalOrCertifiedTrueCopy->accepts(PhysicalCopyRequirement::Photocopy))->toBeFalse()
        ->and(PhysicalCopyRequirement::Photocopy->accepts(PhysicalCopyRequirement::Photocopy))->toBeTrue();
});
