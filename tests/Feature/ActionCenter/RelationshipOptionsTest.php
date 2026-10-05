<?php

use App\Core\ActionCenter\Enums\Relationship;
use App\External\Api\Request\ActionCenter\StoreAssistanceRequest;
use Illuminate\Support\Facades\Validator;

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

it('offers every non-head household relationship for assisted-person declarations', function () {
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
        Relationship::Guardian->value,
        Relationship::Ward->value,
        Relationship::OtherRelative->value,
        Relationship::NonRelative->value,
    ])->not->toContain(Relationship::Head->value);
});

it('checks the filer age using the assisted persons relationship to the filer', function () {
    $options = collect(Relationship::assistanceRepresentativeOptions())->keyBy('value');

    expect($options[Relationship::Parent->value]['requires_legal_age'])->toBeTrue()
        ->and($options[Relationship::Sibling->value]['requires_legal_age'])->toBeTrue()
        ->and($options[Relationship::Child->value]['requires_legal_age'])->toBeFalse();
});

it('rejects a full relationship map submitted through citizen filing', function () {
    $request = StoreAssistanceRequest::create('/', 'POST', [
        'filer_relationships' => ['01K7AAA0000000000000000000' => 'parent'],
    ]);

    expect(Validator::make($request->all(), [
        'filer_relationships' => $request->rules()['filer_relationships'],
    ])->fails())->toBeTrue();
});
