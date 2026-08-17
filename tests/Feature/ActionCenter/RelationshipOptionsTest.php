<?php

use App\Core\ActionCenter\Enums\Relationship;

it('offers the expanded relationship set for household composition', function () {
    $options = collect(Relationship::toOptions())->keyBy('value');

    expect($options)
        ->not->toHaveKey(Relationship::Head->value)
        ->toHaveKeys([
            Relationship::Spouse->value,
            Relationship::LiveInPartner->value,
            Relationship::Grandparent->value,
            Relationship::Grandchild->value,
            Relationship::ParentInLaw->value,
            Relationship::ChildInLaw->value,
            Relationship::StepParent->value,
            Relationship::StepChild->value,
            Relationship::AuntUncle->value,
            Relationship::NieceNephew->value,
            Relationship::Cousin->value,
            Relationship::Guardian->value,
            Relationship::Ward->value,
            Relationship::OtherRelative->value,
            Relationship::NonRelative->value,
        ]);
});

it('keeps assistance representatives limited to the existing eligible relationships', function () {
    expect(Relationship::assistanceRepresentativeValues())->toBe([
        Relationship::Spouse->value,
        Relationship::Parent->value,
        Relationship::Child->value,
        Relationship::Sibling->value,
    ])->not->toContain(
        Relationship::LiveInPartner->value,
        Relationship::Grandparent->value,
        Relationship::OtherRelative->value,
        Relationship::NonRelative->value,
    );
});
