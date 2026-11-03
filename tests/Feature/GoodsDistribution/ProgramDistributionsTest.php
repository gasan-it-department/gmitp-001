<?php

use App\Core\GoodsDistribution\Enums\DistributionStatus;
use App\Core\GoodsDistribution\Models\Program;
use App\Core\GoodsDistribution\Models\StockMovement;
use Illuminate\Support\Str;

require_once __DIR__.'/../../Support/GoodsDistributionFixture.php';

beforeEach(function () {
    $this->withoutVite();
    goodsDistributionFixture($this);
});
afterEach(fn () => goodsDistributionCleanup());

function programDistributionUrl(object $test): string
{
    return '/inventory-test/goods-distribution/programs/'.$test->program->id.'?tab=distributions';
}

it('scopes every status to the route program and keeps viewing read only', function () {
    foreach (DistributionStatus::cases() as $status) {
        goodsRequest($this)->update(['status' => $status]);
    }
    $other = Program::create(['municipal_id' => $this->municipalId, 'code' => 'OTHER', 'name' => 'Other program', 'is_active' => true]);
    $outside = goodsRequest($this);
    $outside->update(['program_id' => $other->id]);
    $count = \App\Core\GoodsDistribution\Models\DistributionRequest::count();
    $movements = StockMovement::count();
    goodsInventoryHttp($this, ['goods_distribution.requests.view']);
    $response = $this->get(programDistributionUrl($this).'&program_id='.$other->id, ['X-Inertia' => 'true'])->assertOk()
        ->assertJsonPath('props.tab', 'distributions')->assertJsonPath('props.filters.program_id', $this->program->id)
        ->assertJsonPath('props.records.meta.total', count(DistributionStatus::cases()));
    expect(collect($response->json('props.records.data'))->pluck('id'))->not->toContain($outside->id);
    foreach (DistributionStatus::cases() as $status) {
        $this->get(programDistributionUrl($this).'&status='.$status->value, ['X-Inertia' => 'true'])
            ->assertOk()->assertJsonPath('props.records.meta.total', 1);
    }
    expect(\App\Core\GoodsDistribution\Models\DistributionRequest::count())->toBe($count)->and(StockMovement::count())->toBe($movements);
});

it('requires request viewing but leaves stock and inactive program history accessible', function () {
    goodsRequest($this);
    goodsInventoryHttp($this, []);
    $this->get(programDistributionUrl($this))->assertForbidden();
    $this->get('/inventory-test/goods-distribution/programs/'.$this->program->id)->assertOk();
    goodsInventoryHttp($this, ['goods_distribution.requests.view']);
    $this->program->update(['is_active' => false]);
    $this->get(programDistributionUrl($this), ['X-Inertia' => 'true'])->assertOk()->assertJsonPath('props.program.is_active', false);
    $foreign = Program::create(['municipal_id' => $this->otherMunicipalId, 'code' => 'FOREIGN', 'name' => 'Foreign', 'is_active' => true]);
    $this->get('/inventory-test/goods-distribution/programs/'.$foreign->id.'?tab=distributions')->assertNotFound();
});

it('filters dates and search and paginates newest first without accepting receipt statuses', function () {
    $first = goodsRequest($this);
    $first->update(['created_at' => '2026-01-01 12:00:00']);
    for ($i = 0; $i < 21; $i++) {
        goodsRequest($this)->update(['created_at' => '2026-02-01 12:00:00']);
    }
    goodsInventoryHttp($this, ['goods_distribution.requests.view']);
    $this->get(programDistributionUrl($this), ['X-Inertia' => 'true'])->assertOk()->assertJsonCount(20, 'props.records.data')->assertJsonPath('props.records.meta.total', 22);
    $this->get(programDistributionUrl($this).'&page=2', ['X-Inertia' => 'true'])->assertOk()->assertJsonCount(2, 'props.records.data')->assertJsonPath('props.records.data.1.id', $first->id);
    $this->get(programDistributionUrl($this).'&from=2026-01-01&to=2026-01-31&search='.$first->reference, ['X-Inertia' => 'true'])->assertOk()->assertJsonPath('props.records.meta.total', 1);
    $this->getJson(programDistributionUrl($this).'&status=posted')->assertUnprocessable();
    $this->getJson('/inventory-test/goods-distribution/programs/'.$this->program->id.'?tab=receipts&status=pending')->assertUnprocessable();
});

it('validates program return context for create detail and edit without granting program access', function () {
    $record = goodsRequest($this);
    goodsInventoryHttp($this, ['goods_distribution.requests.view', 'goods_distribution.requests.intake']);
    $context = ['program_context_id' => $this->program->id, 'program_search' => 'Susan', 'program_status' => 'pending', 'program_page' => '2'];
    $base = '/inventory-test/goods-distribution/distribution';
    foreach (['/'.$record->id, '/'.$record->id.'/edit', '/create?program_id='.$this->program->id] as $suffix) {
        $this->get($base.$suffix.(str_contains($suffix, '?') ? '&' : '?').http_build_query($context), ['X-Inertia' => 'true'])
            ->assertOk()->assertJsonPath('props.programContext', $context);
    }
    $this->get($base.'/'.$record->id.'?program_context_id='.(string) Str::ulid(), ['X-Inertia' => 'true'])->assertOk()->assertJsonPath('props.programContext', null);
    $this->actor->revokePermissionTo('goods_distribution.inventory.view');
    $this->get($base.'/'.$record->id.'?'.http_build_query($context), ['X-Inertia' => 'true'])->assertOk()->assertJsonPath('props.programContext', null);
});

it('isolates distribution schema readiness from the stock tab', function () {
    goodsInventoryHttp($this, ['goods_distribution.requests.view']);
    \Illuminate\Support\Facades\Schema::rename('gd_distribution_cooldowns', 'gd_distribution_cooldowns_pending');
    try {
        $this->get(programDistributionUrl($this), ['X-Inertia' => 'true'])->assertOk()->assertJsonPath('component', 'GoodsDistribution/Inventory/Unavailable');
        $this->get('/inventory-test/goods-distribution/programs/'.$this->program->id, ['X-Inertia' => 'true'])->assertOk()->assertJsonPath('props.tab', 'stock');
    } finally {
        \Illuminate\Support\Facades\Schema::rename('gd_distribution_cooldowns_pending', 'gd_distribution_cooldowns');
    }
});
