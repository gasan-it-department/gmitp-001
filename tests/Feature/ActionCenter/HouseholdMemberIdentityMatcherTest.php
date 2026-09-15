<?php

use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\Services\HouseholdMemberIdentityMatcher;

it('matches identity using normalized names and an exact birth date', function (): void {
    $member = new HouseholdMember([
        'first_name' => '  Maria-Luisa ',
        'middle_name' => 'Dela Pena',
        'last_name' => "O'Connor",
        'suffix' => 'Jr.',
        'birth_date' => '1990-04-12',
    ]);
    $beneficiary = new Beneficiary([
        'first_name' => 'MARIA LUISA',
        'middle_name' => 'DELA-PENA',
        'last_name' => 'O CONNOR',
        'suffix' => 'JR',
        'birth_date' => '1990-04-12',
    ]);

    expect(app(HouseholdMemberIdentityMatcher::class)->mismatches($member, $beneficiary))->toBe([]);
});

it('reports required and conflicting identity fields without fuzzy matching', function (): void {
    $member = new HouseholdMember([
        'first_name' => 'MARIA',
        'middle_name' => 'CLARA',
        'last_name' => 'SANTOS',
        'birth_date' => '1990-04-12',
    ]);
    $beneficiary = new Beneficiary([
        'first_name' => 'MARIE',
        'middle_name' => 'CRISTINA',
        'last_name' => null,
        'birth_date' => '1990-04-13',
    ]);

    $mismatches = app(HouseholdMemberIdentityMatcher::class)->mismatches($member, $beneficiary);

    expect(array_keys($mismatches))->toBe([
        'first_name',
        'last_name',
        'birth_date',
        'middle_name',
    ]);
});
