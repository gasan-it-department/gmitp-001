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

it('allows recognized family relatives as assistance representatives', function () {
    expect(Relationship::assistanceRepresentativeValues())->toBe([
        Relationship::Spouse->value,
        Relationship::LiveInPartner->value,
        Relationship::Parent->value,
        Relationship::Child->value,
        Relationship::Sibling->value,
        Relationship::Grandparent->value,
        Relationship::Grandchild->value,
        Relationship::StepParent->value,
        Relationship::StepChild->value,
        Relationship::ParentInLaw->value,
        Relationship::ChildInLaw->value,
        Relationship::AuntUncle->value,
        Relationship::NieceNephew->value,
        Relationship::Cousin->value,
        Relationship::OtherRelative->value,
    ])->not->toContain(
        Relationship::Guardian->value,
        Relationship::Ward->value,
        Relationship::NonRelative->value,
    );
});
