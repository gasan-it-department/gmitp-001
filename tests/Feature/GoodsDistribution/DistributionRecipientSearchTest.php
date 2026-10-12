<?php

use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\GoodsDistribution\Actions\ReadDistributionRequestsAction;
use App\Core\GoodsDistribution\Models\DistributionRequest;
use App\Core\GoodsDistribution\Models\StockMovement;

require_once __DIR__.'/../../Support/GoodsDistributionFixture.php';
beforeEach(fn () => goodsDistributionFixture($this));
afterEach(fn () => goodsDistributionCleanup());

it('finds the existing recipient by full name middle name suffix partial names and beneficiary number', function (string $search) {
    $this->filer->update(['middle_name' => 'Palomares', 'suffix' => 'Jr.']);
    $rows = app(ReadDistributionRequestsAction::class)->recipients($this->municipalId, $search);
    expect(array_column($rows, 'id'))->toBe([$this->filer->id])
        ->and($rows[0]['name'])->toBe('Susan Palomares Solis Jr.');
})->with([
    'Susan Palomares Solis',
    'Susan Palomares Solis Jr.',
    'sUsAn pAlOmArEs sOlIs jR.',
    "  Susan   Palomares\tSolis\nJr.  ",
    'Palomares',
    'Susan Pal',
    'Jr',
    'Susan Solis',
    'GD-PERSON-1',
]);

it('allows nullable middle names and suffixes without losing first and last name matches', function () {
    $this->filer->update(['middle_name' => null, 'suffix' => null]);
    $read = app(ReadDistributionRequestsAction::class);
    expect(array_column($read->recipients($this->municipalId, 'Susan Solis'), 'id'))->toBe([$this->filer->id])
        ->and($read->recipients($this->municipalId, 'Susan Palomares'))->toBe([]);
});

it('requires every search word to match the same beneficiary', function () {
    $this->filer->update(['middle_name' => 'Palomares']);
    Beneficiary::create(['municipal_id' => $this->municipalId, 'household_id' => $this->household->id,
        'first_name' => 'Kenneth', 'middle_name' => 'Rivera', 'last_name' => 'Solis', 'beneficiary_number' => 'GD-PERSON-2']);
    $read = app(ReadDistributionRequestsAction::class);
    expect($read->recipients($this->municipalId, 'Susan Rivera'))->toBe([])
        ->and($read->recipients($this->municipalId, 'Kenneth Palomares'))->toBe([])
        ->and(array_column($read->recipients($this->municipalId, 'Susan Palomares Solis'), 'id'))->toBe([$this->filer->id]);
});

it('excludes foreign inactive merged and deleted profiles when a middle name or suffix matches', function () {
    $this->filer->update(['middle_name' => 'Palomares', 'suffix' => 'Jr.']);
    foreach (['foreign', 'inactive', 'merged', 'deleted'] as $kind) {
        $candidate = Beneficiary::create([
            'municipal_id' => $kind === 'foreign' ? $this->otherMunicipalId : $this->municipalId,
            'household_id' => $this->household->id, 'first_name' => 'Susan', 'middle_name' => 'Palomares',
            'last_name' => 'Solis', 'suffix' => 'Jr.', 'is_active' => $kind !== 'inactive',
            'merged_into_beneficiary_id' => $kind === 'merged' ? $this->filer->id : null,
        ]);
        if ($kind === 'deleted') {
            $candidate->delete();
        }
    }
    $read = app(ReadDistributionRequestsAction::class);
    foreach (['Susan Palomares Solis Jr.', 'Palomares', 'Jr'] as $search) {
        expect(array_column($read->recipients($this->municipalId, $search), 'id'))->toBe([$this->filer->id]);
    }
});

it('keeps the recipient search limited to twenty results', function () {
    $this->filer->update(['middle_name' => 'Palomares']);
    for ($index = 0; $index < 21; $index++) {
        Beneficiary::create(['municipal_id' => $this->municipalId, 'household_id' => $this->household->id,
            'first_name' => 'Recipient', 'middle_name' => 'Palomares', 'last_name' => 'Solis'.$index]);
    }
    expect(app(ReadDistributionRequestsAction::class)->recipients($this->municipalId, 'Palomares'))->toHaveCount(20);
});

it('supports full names through the recipient lookup API without exposing contact or media data', function () {
    $this->filer->update(['middle_name' => 'Palomares', 'suffix' => 'Jr.']);
    goodsInventoryHttp($this, ['goods_distribution.requests.view']);
    $this->postJson('/api/goods-distribution/requests/recipients/search', ['search' => 'Susan Palomares Solis Jr.'])
        ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $this->filer->id)
        ->assertJsonPath('data.0.name', 'Susan Palomares Solis Jr.')
        ->assertJsonMissingPath('data.0.contact_number')->assertJsonMissingPath('data.0.media');
    expect(DistributionRequest::count())->toBe(0)->and(StockMovement::count())->toBe(0);
    $this->actor->syncPermissions(['goods_distribution.access']);
    $this->postJson('/api/goods-distribution/requests/recipients/search', ['search' => 'Palomares'])->assertForbidden();
});
