<?php

use App\Core\GoodsDistribution\Models\BulkDispatch;
use App\Core\GoodsDistribution\Models\StockMovement;
use App\Core\Users\Enums\EnumPermissions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

require_once __DIR__.'/../../Support/BulkDispatchFixture.php';

beforeEach(function () {
    $this->withoutVite();
    bulkFixture($this);
    goodsReceipt($this, true);
    goodsInventoryHttp($this, collect(['view', 'prepare', 'approve', 'dispatch', 'reconcile', 'correct'])
        ->map(fn ($capability) => 'goods_distribution.bulk_dispatches.'.$capability)->all());
});
afterEach(fn () => goodsDistributionCleanup());

it('shows bulk pages and handles approval departure report return and closure through HTTP', function () {
    $base = '/inventory-test/goods-distribution/bulk-dispatches';
    $api = '/api/goods-distribution/bulk-dispatches';
    $this->get($base, ['X-Inertia' => 'true'])->assertOk()->assertJsonPath('component', 'GoodsDistribution/BulkDispatch/Index');
    $this->get($base.'/create?program_id='.$this->program->id, ['X-Inertia' => 'true'])->assertOk()->assertJsonPath('component', 'GoodsDistribution/BulkDispatch/Form');
    $this->get('/inventory-test/goods-distribution/programs/'.$this->program->id.'?tab=dispatches', ['X-Inertia' => 'true'])
        ->assertOk()->assertJsonPath('props.tab', 'dispatches');
    $this->getJson($api.'/items?program_id='.$this->program->id)->assertOk()->assertJsonPath('data.0.id', $this->item->id);
    $response = $this->postJson($api, bulkData($this));
    $response->assertOk();
    $id = $response->json('data.id');
    $this->get($base.'/'.$id, ['X-Inertia' => 'true'])->assertOk()->assertJsonPath('props.dispatch.id', $id);
    $this->get($base.'/'.$id.'/edit', ['X-Inertia' => 'true'])->assertOk()->assertJsonPath('component', 'GoodsDistribution/BulkDispatch/Form');
    $draft = BulkDispatch::findOrFail($id);
    $preview = $this->postJson($api.'/'.$id.'/approval-preview', ['version' => $draft->version])->assertOk()->json('data');
    $this->postJson($api.'/'.$id.'/approve', ['version' => $draft->version, 'operation_key' => (string) Str::uuid(), 'fingerprint' => $preview['fingerprint']])->assertOk();
    $approved = $draft->fresh();
    $this->get($base.'/'.$id.'/edit')->assertStatus(409);
    $this->postJson($api.'/'.$id.'/dispatch', ['version' => $approved->version, 'operation_key' => (string) Str::uuid(),
        'actual_on' => today()->toDateString(), 'custodian_acknowledged' => true,
        'confirmed_allocation_ids' => $approved->allocations()->pluck('id')->all()])->assertOk();
    $issued = $draft->fresh();
    $this->get($base.'/'.$id.'?tab=reconciliation', ['X-Inertia' => 'true'])->assertOk()->assertJsonPath('props.allocations.0.with_staff', '100.000');
    $report = ['version' => $issued->version, 'kind' => 'distribution', 'actual_on' => today()->toDateString(),
        'lines' => [['item_id' => $this->item->id, 'quantity' => '80']]];
    $fingerprint = $this->postJson($api.'/'.$id.'/reconciliation-preview', $report)->assertOk()->json('data.fingerprint');
    $this->postJson($api.'/'.$id.'/report', [...$report, 'operation_key' => (string) Str::uuid(), 'fingerprint' => $fingerprint])->assertOk();
    $issued->refresh();
    $returned = ['version' => $issued->version, 'kind' => 'return', 'actual_on' => today()->toDateString(),
        'lines' => [['allocation_id' => $issued->allocations()->first()->id, 'quantity' => '20']]];
    $fingerprint = $this->postJson($api.'/'.$id.'/reconciliation-preview', $returned)->assertOk()->json('data.fingerprint');
    $this->postJson($api.'/'.$id.'/return', [...$returned, 'operation_key' => (string) Str::uuid(), 'fingerprint' => $fingerprint, 'usable_confirmed' => true])->assertOk();
    $issued->refresh();
    $this->postJson($api.'/'.$id.'/close', ['version' => $issued->version, 'operation_key' => (string) Str::uuid()])->assertOk();
    expect(BulkDispatch::findOrFail($id)->status->value)->toBe('closed')->and(StockMovement::where('type', 'bulk_dispatch')->count())->toBe(1)
        ->and(StockMovement::where('type', 'bulk_return')->count())->toBe(1);
});

it('enforces the bulk capability and municipality boundary on direct routes', function () {
    foreach (['store' => 'prepare', 'approve' => 'approve', 'dispatch' => 'dispatch', 'returnGoods' => 'reconcile', 'reverse' => 'correct'] as $name => $capability) {
        $route = Route::getRoutes()->getByName('goodsDistribution.bulk.api.'.$name);
        expect($route->gatherMiddleware())->toContain('permission:goods_distribution.access', 'permission:goods_distribution.bulk_dispatches.view', 'permission:goods_distribution.bulk_dispatches.'.$capability);
        expect($route->gatherMiddleware())->not->toContain('permission:action_center.access');
    }
    expect(EnumPermissions::GOODS_DISTRIBUTION_BULK_CORRECT->dependencies())->toBe(['goods_distribution.access', 'goods_distribution.bulk_dispatches.view', 'goods_distribution.bulk_dispatches.reconcile']);
    $record = bulkDraft($this);
    $this->actor->syncPermissions(['goods_distribution.access', 'goods_distribution.bulk_dispatches.view']);
    $this->postJson('/api/goods-distribution/bulk-dispatches', bulkData($this))->assertForbidden();
    $this->get('/inventory-test/goods-distribution/bulk-dispatches/'.$record->id, ['X-Inertia' => 'true'])->assertOk();
    app()->instance('municipal_id', $this->otherMunicipalId);
    $this->get('/inventory-test/goods-distribution/bulk-dispatches/'.$record->id)->assertForbidden();
    $this->postJson('/api/goods-distribution/bulk-dispatches/'.$record->id.'/approval-preview', [])->assertForbidden();
});

it('serves enum choices and validates and filters school and other purposes', function () {
    $api = '/api/goods-distribution/bulk-dispatches';
    $base = '/inventory-test/goods-distribution/bulk-dispatches';
    $this->get($base.'/create', ['X-Inertia' => 'true'])->assertOk()
        ->assertJsonPath('props.options.custodian_types.0.label', 'Municipal / LGU staff')
        ->assertJsonPath('props.options.custodian_types.2.value', 'other_representative')
        ->assertJsonPath('props.options.purposes.2.value', 'school_distribution');
    $this->postJson($api, bulkData($this, ['purpose' => 'Unlisted purpose']))->assertUnprocessable()->assertJsonValidationErrors('purpose');
    $this->postJson($api, bulkData($this, ['custodian_type' => 'teacher']))->assertUnprocessable()->assertJsonValidationErrors('custodian_type');
    $id = $this->postJson($api, bulkData($this, ['custodian_type' => 'other_representative', 'custodian_name' => 'Maria Reyes',
        'custodian_role' => 'School principal', 'purpose' => 'school_distribution', 'purpose_notes' => 'Student food packs', 'location_notes' => null]))
        ->assertOk()->json('data.id');
    $this->get($base.'/'.$id, ['X-Inertia' => 'true'])->assertOk()
        ->assertJsonPath('props.dispatch.custodian_type_label', 'Other representative')->assertJsonPath('props.dispatch.purpose_label', 'School distribution');
    $draft = BulkDispatch::findOrFail($id);
    $this->postJson($api.'/'.$id.'/approval-preview', ['version' => $draft->version])->assertUnprocessable();
    $data = [...bulkData($this, ['custodian_type' => 'other_representative', 'custodian_name' => 'Maria Reyes', 'custodian_role' => 'School principal',
        'purpose' => 'school_distribution', 'purpose_notes' => 'Student food packs', 'location_notes' => 'Gasan Central School']),
        'version' => $draft->version, 'operation_key' => (string) Str::uuid()];
    $this->patchJson($api.'/'.$id, $data)->assertOk();
    $this->get($base.'/'.$id, ['X-Inertia' => 'true'])->assertOk()->assertJsonPath('props.dispatch.purpose_notes', 'Student food packs');
    $this->get($base.'?purpose=school_distribution&custodian_type=other_representative', ['X-Inertia' => 'true'])
        ->assertOk()->assertJsonPath('props.records.meta.total', 1)->assertJsonPath('props.records.data.0.id', $id);
    $this->get($base.'?purpose=home_delivery', ['X-Inertia' => 'true'])->assertOk()->assertJsonPath('props.records.meta.total', 0);
    $this->get($base.'/'.$id.'?tab=history', ['X-Inertia' => 'true'])->assertOk()
        ->assertJsonPath('props.history.data.0.properties.before.location_notes', null)
        ->assertJsonPath('props.history.data.0.properties.after.location_notes', 'Gasan Central School')
        ->assertJsonPath('props.historyChoices.purposes.2.label', 'School distribution');
    $draft->refresh();
    $preview = $this->postJson($api.'/'.$id.'/approval-preview', ['version' => $draft->version])->assertOk()->json('data');
    $this->postJson($api.'/'.$id.'/approve', ['version' => $draft->version, 'operation_key' => (string) Str::uuid(), 'fingerprint' => $preview['fingerprint']])
        ->assertOk();
    $this->get($base.'/'.$id, ['X-Inertia' => 'true'])->assertOk()->assertJsonPath('props.dispatch.purpose_label', 'School distribution');
    expect($draft->fresh()->approval_snapshot['location_notes'])->toBe('Gasan Central School');
});

it('allows optional append only evidence with protected downloads after closure', function () {
    Storage::fake('local');
    $record = bulkDraft($this);
    $base = '/api/goods-distribution/bulk-dispatches/'.$record->id;
    $this->post($base.'/attachments', ['version' => $record->version, 'operation_key' => (string) Str::uuid(),
        'file' => UploadedFile::fake()->createWithContent('trip.pdf', "%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF")])->assertOk();
    $record->refresh();
    $media = $record->getMedia('bulk_dispatch_evidence')->first();
    expect($media)->not->toBeNull();
    $this->get('/inventory-test/goods-distribution/bulk-dispatches/'.$record->id.'/attachments/'.$media->id)
        ->assertOk()->assertDownload('trip.pdf')
        ->assertHeader('Cache-Control', 'no-store, private')
        ->assertHeader('X-Content-Type-Options', 'nosniff');
    $this->postJson($base.'/attachments', ['version' => $record->version, 'operation_key' => (string) Str::uuid()])->assertUnprocessable();
    expect($record->fresh()->getMedia('bulk_dispatch_evidence')->count())->toBe(1);
});
