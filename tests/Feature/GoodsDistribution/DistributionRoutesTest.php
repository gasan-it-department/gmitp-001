<?php

use App\Core\ActionCenter\Models\DocumentType;
use App\Core\GoodsDistribution\Actions\ReviewDistributionDocumentAction;
use App\Core\GoodsDistribution\Dto\DistributionRequestDto;
use App\Core\GoodsDistribution\Enums\DistributionStatus;
use App\Core\GoodsDistribution\Models\DistributionRequest;
use App\Core\GoodsDistribution\Models\StockMovement;
use App\Core\GoodsDistribution\Models\StorageLocation;
use App\Core\Users\Enums\EnumPermissions;
use App\External\Api\Request\GoodsDistribution\DistributionPageRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

require_once __DIR__.'/../../Support/GoodsDistributionFixture.php';
beforeEach(function () {
    $this->withoutVite();
    goodsDistributionFixture($this);
});
afterEach(fn () => goodsDistributionCleanup());

function distributionHttp(object $test, array $capabilities): void
{
    goodsInventoryHttp($test, ['goods_distribution.requests.view', ...$capabilities]);
}

it('validates distribution statuses with the existing backend enum', function () {
    $rules = (new DistributionPageRequest)->rules();
    foreach (DistributionStatus::cases() as $status) {
        expect(Validator::make(['status' => $status->value], ['status' => $rules['status']])->passes())->toBeTrue();
    }
    expect(Validator::make(['status' => 'unsupported'], ['status' => $rules['status']])->fails())->toBeTrue();
    $request = goodsRequest($this);
    expect(fn () => $request->status = 'unsupported')->toThrow(ValueError::class);
    expect($request->fresh()->status)->toBe(DistributionStatus::Pending);
});

it('uses independent GD permissions and municipality header API conventions', function () {
    foreach (['store' => 'intake', 'review' => 'process', 'approve' => 'decide', 'cancel' => 'decide', 'release' => 'release'] as $name => $capability) {
        $route = Route::getRoutes()->getByName('goodsDistribution.requests.api.'.$name);
        expect($route->gatherMiddleware())->toContain('permission:goods_distribution.access', 'permission:goods_distribution.requests.view', 'permission:goods_distribution.requests.'.$capability);
        expect($route->uri())->not->toContain('{municipality}');
        expect($route->gatherMiddleware())->not->toContain('permission:action_center.access');
    }
    expect(EnumPermissions::GOODS_DISTRIBUTION_REQUESTS_RELEASE->dependencies())->toBe(['goods_distribution.access', 'goods_distribution.requests.view']);
});

it('opens list form profile and tabs without Action Center access', function () {
    $request = goodsRequest($this);
    distributionHttp($this, ['goods_distribution.requests.intake']);
    $prefix = '/inventory-test/goods-distribution/distribution';
    $this->get($prefix, ['X-Inertia' => 'true'])->assertOk()->assertJsonPath('component', 'GoodsDistribution/Distribution/Index');
    $this->get($prefix.'/create', ['X-Inertia' => 'true'])->assertOk()->assertJsonPath('props.canRegister', false);
    foreach (['goods', 'household', 'documents', 'history'] as $tab) {
        $this->get($prefix.'/'.$request->id.'?tab='.$tab, ['X-Inertia' => 'true'])->assertOk()
            ->assertJsonPath('props.request.lines', fn ($lines) => array_is_list($lines));
    }
    expect($this->actor->can('action_center.access'))->toBeFalse();
});

it('enforces separate intake process decide and release capabilities', function () {
    goodsReceipt($this, true);
    $request = goodsRequest($this);
    distributionHttp($this, []);
    $base = '/api/goods-distribution/requests';
    $this->postJson($base, distributionData($this))->assertForbidden();
    $this->postJson($base.'/'.$request->id.'/review', ['version' => 1, 'operation_key' => 'test'])->assertForbidden();
    distributionHttp($this, ['goods_distribution.requests.process']);
    $this->postJson($base.'/'.$request->id.'/review', ['version' => 1, 'operation_key' => 'review-test'])->assertOk();
    $request->refresh();
    $this->postJson($base.'/'.$request->id.'/approve', ['version' => $request->version, 'operation_key' => 'approval', 'recipient_reviewed' => true])->assertForbidden();
    distributionHttp($this, ['goods_distribution.requests.decide']);
    $this->postJson($base.'/'.$request->id.'/approve', ['version' => $request->version, 'operation_key' => 'approval', 'recipient_reviewed' => true])->assertOk();
    $request->refresh();
    distributionHttp($this, ['goods_distribution.requests.process']);
    $this->postJson($base.'/'.$request->id.'/return', ['version' => $request->version, 'operation_key' => 'return', 'reason' => 'Correct the request'])->assertForbidden();
    distributionHttp($this, ['goods_distribution.requests.release']);
    $payload = ['version' => $request->version, 'operation_key' => 'release', ...goodsReleaseData($request)];
    $this->postJson($base.'/'.$request->id.'/release', [...$payload, 'collector_type' => 'representative'])->assertUnprocessable()
        ->assertJsonValidationErrors(['collector_name', 'collector_relationship', 'collector_id_type', 'collector_id_last_four']);
    $this->postJson($base.'/'.$request->id.'/release', $payload)->assertOk();
    $this->postJson($base.'/'.$request->id.'/release', $payload)->assertOk();
    expect(StockMovement::where('type', 'distribution')->count())->toBe(1);
});

it('protects direct posts lookup and downloads across municipalities', function () {
    $request = goodsRequest($this);
    distributionHttp($this, ['goods_distribution.requests.intake']);
    $this->postJson('/api/goods-distribution/requests', [])->assertUnprocessable();
    $this->getJson('/api/goods-distribution/requests/items?program_id='.$this->program->id)->assertOk()->assertJsonPath('data.0.id', $this->item->id);
    $this->getJson('/api/goods-distribution/requests/items?program_id='.$this->program->id.'&search=missing')->assertOk()->assertJsonCount(0, 'data');
    $this->postJson('/api/goods-distribution/requests/recipients/search', ['search' => 'Susan'])->assertOk()->assertJsonPath('data.0.id', $this->filer->id)
        ->assertJsonMissingPath('data.0.contact_number')->assertJsonMissingPath('data.0.media');
    $foreign = StorageLocation::create(['municipal_id' => $this->otherMunicipalId, 'name' => 'Other storage', 'code' => 'OTHER', 'is_active' => true]);
    $this->postJson('/api/goods-distribution/requests', distributionData($this, ['storage_location_id' => $foreign->id]))->assertNotFound();
    app()->instance('municipal_id', $this->otherMunicipalId);
    $this->get('/inventory-test/goods-distribution/distribution/'.$request->id)->assertNotFound();
    $this->postJson('/api/goods-distribution/requests/recipients/search', ['beneficiary_id' => $this->filer->id])->assertNotFound();
    $this->postJson('/api/goods-distribution/requests/recipients/search', ['search' => 'Susan'])->assertOk()->assertJsonCount(0, 'data');
});

it('excludes representative-only fields from recipient handover API submissions', function () {
    goodsReceipt($this, true);
    $request = goodsApproval($this, goodsRequest($this));
    distributionHttp($this, ['goods_distribution.requests.release']);
    $payload = ['version' => $request->version, 'operation_key' => 'recipient-handover', ...goodsReleaseData($request),
        'collector_name' => ['unexpected'], 'collector_relationship' => ['unexpected'],
        'collector_id_type' => ['unexpected'], 'collector_id_last_four' => 'invalid-length'];
    $url = '/api/goods-distribution/requests/'.$request->id.'/release';
    $this->postJson($url, $payload)->assertOk();
    $this->postJson($url, $payload)->assertOk();
    $request->refresh();
    expect($request->collector_name)->toBe($request->reviewed_snapshot['subject']['name'])
        ->and($request->collector_relationship)->toBeNull()->and($request->collector_id_type)->toBeNull()
        ->and($request->collector_id_last_four)->toBeNull()->and(StockMovement::where('type', 'distribution')->count())->toBe(1);
});

it('keeps document endpoint checks for public and private media disks', function (string $disk) {
    Storage::fake($disk);
    config(['goods_distribution.document_disk' => $disk]);
    $request = goodsRequest($this);
    $check = $request->documentChecks()->create(['municipal_id' => $this->municipalId, 'document_key' => 'id', 'label' => 'ID',
        'evidence_mode' => 'upload', 'physical_copy_requirement' => 'unspecified', 'is_required' => true, 'sort_order' => 0]);
    app(ReviewDistributionDocumentAction::class)->execute(new DistributionRequestDto($this->municipalId, $this->actor->id, ['version' => 1], $request->id), $check->id,
        UploadedFile::fake()->createWithContent('proof.pdf', "%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF"));
    $other = goodsRequest($this);
    distributionHttp($this, []);
    $url = '/inventory-test/goods-distribution/distribution/'.$request->id.'/documents/'.$check->id;
    $this->get($url)->assertOk()->assertHeader('X-Content-Type-Options', 'nosniff');
    $this->get(str_replace($request->id, $other->id, $url))->assertNotFound();
    app()->instance('municipal_id', $this->otherMunicipalId);
    $this->get($url)->assertNotFound();
})->with(['local', 'public']);

it('allows inventory managers to configure documents without request permissions', function () {
    $type = DocumentType::create(['key' => 'id', 'label' => 'ID', 'is_active' => true]);
    goodsInventoryHttp($this, ['goods_distribution.inventory.manage']);
    $read = app(\App\Core\GoodsDistribution\Actions\ReadDistributionRequestsAction::class);
    $data = ['requirements_fingerprint' => $read->requirements($this->municipalId, $this->program->id)['requirements_fingerprint'],
        'requirements' => [['document_type_id' => $type->id, 'is_required' => true, 'evidence_mode' => 'both', 'physical_copy_requirement' => 'photocopy']]];
    $this->putJson('/api/goods-distribution/programs/'.$this->program->id.'/documents', $data)->assertOk();
    $this->putJson('/api/goods-distribution/programs/'.$this->program->id.'/documents', $data)->assertUnprocessable();
    $this->get('/inventory-test/goods-distribution/programs/'.$this->program->id.'?tab=documents', ['X-Inertia' => 'true'])->assertOk()
        ->assertJsonPath('props.documentSettings.requirements.0.evidence_mode', 'both');
});

it('never grants registration implicitly and enforces access dependencies', function () {
    distributionHttp($this, ['goods_distribution.requests.intake']);
    $this->get('/inventory-test/goods-distribution/registration/create')->assertForbidden();
    $this->actor->syncPermissions(['goods_distribution.requests.intake']);
    $this->postJson('/api/goods-distribution/requests', distributionData($this))->assertForbidden();
    expect(DistributionRequest::count())->toBe(0);
});
