<?php

use App\Core\ActionCenter\Models\DocumentType;
use App\Core\GoodsDistribution\Actions\ApplyDistributionRequirementsAction;
use App\Core\GoodsDistribution\Actions\ReviewDistributionDocumentAction;
use App\Core\GoodsDistribution\Dto\DistributionRequestDto;
use App\Core\GoodsDistribution\Models\DistributionRequest;
use App\Core\GoodsDistribution\Models\ProgramDocumentRequirement;
use App\Core\GoodsDistribution\Services\DistributionRequirementsService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Spatie\Activitylog\Models\Activity;

require_once __DIR__.'/../../Support/GoodsDistributionFixture.php';
beforeEach(fn () => goodsDistributionFixture($this));
afterEach(fn () => goodsDistributionCleanup());

function goodsRequirement(object $test, string $key, array $changes = []): ProgramDocumentRequirement
{
    $type = DocumentType::firstOrCreate(['key' => $key], ['label' => strtoupper($key), 'is_active' => true]);

    return ProgramDocumentRequirement::updateOrCreate(['municipal_id' => $test->municipalId, 'program_id' => $test->program->id, 'document_type_id' => $type->id],
        ['is_required' => true, 'evidence_mode' => 'physical', 'physical_copy_requirement' => 'original', 'sort_order' => 0, ...$changes]);
}

function goodsApplyRequirements(object $test, DistributionRequest $request, array $changes = []): DistributionRequest
{
    $preview = app(DistributionRequirementsService::class)->preview($request);

    return app(ApplyDistributionRequirementsAction::class)->execute(new DistributionRequestDto($test->municipalId, $test->actor->id,
        ['version' => $request->fresh()->version, 'operation_key' => (string) Str::uuid(),
            'requirements_fingerprint' => $preview['fingerprint'], 'changes_reviewed' => true, ...$changes], $request->id));
}

it('applies current requirements explicitly in each editable lifecycle state', function (string $status) {
    goodsRequirement($this, 'id');
    $request = goodsRequest($this);
    if ($status !== 'pending') {
        $request = goodsTransition($this, $request, 'review');
    }
    if ($status === 'returned') {
        $request = goodsTransition($this, $request, 'return', ['reason' => 'Correct the checklist']);
    }
    goodsRequirement($this, 'clearance', ['sort_order' => 1]);
    expect($request->documentChecks()->count())->toBe(1);
    $before = $request->fresh()->version;
    $request = goodsApplyRequirements($this, $request);
    expect($request->status->value)->toBe($status)->and($request->version)->toBe($before + 1)
        ->and($request->documentChecks()->count())->toBe(2)
        ->and($request->documentChecks()->where('document_key', 'clearance')->first()->status)->toBe('pending');
    expect(app(DistributionRequirementsService::class)->preview($request)['changed'])->toBeFalse();
    $audit = Activity::where('description', 'Applied updated goods document requirements')->first();
    expect($audit->causer_id)->toBe($this->actor->id)
        ->and($audit->properties['municipal_id'])->toBe($this->municipalId)
        ->and($audit->properties['before']['documents'])->toHaveCount(1)
        ->and($audit->properties['after']['documents'])->toHaveCount(2);
})->with(['pending', 'under_review', 'returned']);

it('preserves unchanged inspections and uploads but resets changed evidence requirements', function () {
    Storage::fake('local');
    $unchanged = goodsRequirement($this, 'id', ['evidence_mode' => 'upload']);
    $changed = goodsRequirement($this, 'indigency', ['sort_order' => 1, 'evidence_mode' => 'upload']);
    $request = goodsTransition($this, goodsRequest($this), 'review');
    $action = app(ReviewDistributionDocumentAction::class);
    $check = $request->documentChecks()->where('document_key', 'id')->first();
    foreach ($request->documentChecks()->get() as $document) {
        $action->execute(new DistributionRequestDto($this->municipalId, $this->actor->id, ['version' => $request->fresh()->version], $request->id),
            $document->id, UploadedFile::fake()->createWithContent('proof.pdf', "%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF"));
        $action->execute(new DistributionRequestDto($this->municipalId, $this->actor->id,
            ['version' => $request->fresh()->version, 'status' => 'verified', 'presented_copy_type' => 'original', 'remarks' => 'Original inspection'], $request->id), $document->id);
    }
    $saved = $check->fresh()->only(['id', 'status', 'current_media_id', 'inspected_media_id', 'checked_at', 'checked_by_user_id', 'remarks']);
    $changedMediaId = $request->documentChecks()->where('document_key', 'indigency')->value('current_media_id');
    $unchanged->update(['is_required' => false]);
    $changed->update(['evidence_mode' => 'both']);
    $request = goodsApplyRequirements($this, $request);
    expect($check->fresh()->only(array_keys($saved)))->toEqual($saved)
        ->and($check->fresh()->is_required)->toBeFalse();
    $reset = $request->documentChecks()->where('document_key', 'indigency')->first();
    expect($reset->status)->toBe('pending')->and($reset->checked_at)->toBeNull()->and($reset->checked_by_user_id)->toBeNull()
        ->and($reset->inspected_media_id)->toBeNull()->and($reset->current_media_id)->toBe($changedMediaId);
    expect($request->media()->count())->toBe(2);
    expect(fn () => goodsTransition($this, $request, 'approve', ['recipient_reviewed' => true]))->toThrow(DomainException::class, 'Inspect every required');
});

it('archives removed checks without deleting evidence and excludes them from approval', function () {
    Storage::fake('local');
    $requirement = goodsRequirement($this, 'id', ['evidence_mode' => 'upload']);
    $request = goodsRequest($this);
    $check = $request->documentChecks()->first();
    $action = app(ReviewDistributionDocumentAction::class);
    $action->execute(new DistributionRequestDto($this->municipalId, $this->actor->id, ['version' => 1], $request->id), $check->id,
        UploadedFile::fake()->createWithContent('proof.pdf', "%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF"));
    $mediaId = $check->fresh()->current_media_id;
    $requirement->delete();
    $request = goodsApplyRequirements($this, $request);
    expect($check->fresh()->is_active)->toBeFalse()->and($check->fresh()->current_media_id)->toBe($mediaId)
        ->and($request->documentChecks()->count())->toBe(1)->and($request->media()->count())->toBe(1);
    expect(fn () => $action->execute(new DistributionRequestDto($this->municipalId, $this->actor->id,
        ['version' => $request->version], $request->id), $check->id,
        UploadedFile::fake()->createWithContent('replacement.pdf', "%PDF-1.4\n%%EOF")))
        ->toThrow(DomainException::class, 'removed from the active checklist');
    goodsReceipt($this, true);
    $request = goodsApproval($this, $request);
    expect($request->status->value)->toBe('approved');
});

it('restores the same check and upload with a fresh inspection instead of duplicating it', function () {
    goodsRequirement($this, 'id');
    $request = goodsRequest($this);
    $check = $request->documentChecks()->first();
    $check->update(['status' => 'verified', 'checked_at' => now(), 'checked_by_user_id' => $this->actor->id]);
    ProgramDocumentRequirement::query()->delete();
    $request = goodsApplyRequirements($this, $request);
    goodsRequirement($this, 'id');
    $preview = app(DistributionRequirementsService::class)->preview($request);
    expect($preview['changes'][0]['kind'])->toBe('restored');
    $request = goodsApplyRequirements($this, $request);
    expect($request->documentChecks()->count())->toBe(1)->and($check->fresh()->is_active)->toBeTrue()
        ->and($check->fresh()->status)->toBe('pending')->and($check->fresh()->checked_at)->toBeNull();
});

it('rejects stale previews versions unreviewed changes and conflicting retries atomically', function () {
    $request = goodsRequest($this);
    $requirement = goodsRequirement($this, 'id');
    $preview = app(DistributionRequirementsService::class)->preview($request);
    $data = ['version' => 1, 'operation_key' => 'apply-once', 'requirements_fingerprint' => $preview['fingerprint'], 'changes_reviewed' => true];
    $action = app(ApplyDistributionRequirementsAction::class);
    $run = fn (array $payload) => $action->execute(new DistributionRequestDto($this->municipalId, $this->actor->id, $payload, $request->id));
    expect(fn () => $run([...$data, 'changes_reviewed' => false]))->toThrow(DomainException::class);
    expect(fn () => $run([...$data, 'version' => 2]))->toThrow(DomainException::class);
    $requirement->update(['is_required' => false]);
    expect(fn () => $run($data))->toThrow(DomainException::class, 'changed after your preview');
    expect($request->documentChecks()->count())->toBe(0)->and($request->fresh()->version)->toBe(1);
    $data['requirements_fingerprint'] = app(DistributionRequirementsService::class)->preview($request)['fingerprint'];
    $run($data);
    $run($data);
    expect($request->fresh()->version)->toBe(2)->and($request->documentChecks()->count())->toBe(1)
        ->and(Activity::where('description', 'Applied updated goods document requirements')->count())->toBe(1);
    expect(fn () => $run([...$data, 'version' => 2]))->toThrow(DomainException::class, 'Operation key');
    goodsApplyRequirements($this, $request);
    expect($request->fresh()->version)->toBe(2);
});

it('requires return before updating approved requests and leaves terminal records immutable', function (string $status) {
    goodsReceipt($this, true);
    $request = goodsApproval($this, goodsRequest($this));
    if ($status === 'released') {
        $request = goodsTransition($this, $request, 'release', goodsReleaseData($request));
    } elseif ($status === 'cancelled') {
        $request = goodsTransition($this, $request, 'cancel', ['reason' => 'Cancelled by the office']);
    }
    goodsRequirement($this, 'id');
    $version = $request->version;
    expect(fn () => goodsApplyRequirements($this, $request))->toThrow(DomainException::class, 'Return approved');
    expect($request->fresh()->version)->toBe($version)->and($request->documentChecks()->count())->toBe(0);
    if ($status === 'approved') {
        expect($request->allocations()->where('status', 'reserved')->count())->toBeGreaterThan(0);
        $request = goodsTransition($this, $request, 'return', ['reason' => 'Apply updated requirements']);
        $request = goodsApplyRequirements($this, $request);
        expect($request->documentChecks()->count())->toBe(1)->and($request->allocations()->where('status', 'reserved')->count())->toBe(0);
    }
})->with(['approved', 'released', 'cancelled']);

it('requires the stage-specific capability and isolates tenants', function () {
    $request = goodsRequest($this);
    goodsRequirement($this, 'id');
    $this->actor->revokePermissionTo('goods_distribution.requests.intake');
    expect(fn () => goodsApplyRequirements($this, $request))->toThrow(AuthorizationException::class);
    $request = goodsTransition($this, $request, 'review');
    $this->actor->revokePermissionTo('goods_distribution.requests.process');
    $this->actor->givePermissionTo('goods_distribution.requests.intake');
    expect(fn () => goodsApplyRequirements($this, $request))->toThrow(AuthorizationException::class);
    expect(fn () => app(ApplyDistributionRequirementsAction::class)->execute(new DistributionRequestDto($this->otherMunicipalId,
        $this->actor->id, ['version' => 1], $request->id)))->toThrow(\Illuminate\Database\Eloquent\ModelNotFoundException::class);
    expect($request->documentChecks()->count())->toBe(0);
});

it('blocks unavailable program document types without changing frozen checks', function () {
    goodsRequirement($this, 'id');
    $request = goodsRequest($this);
    DocumentType::where('key', 'id')->update(['is_active' => false]);
    $preview = app(DistributionRequirementsService::class)->preview($request);
    expect($preview['error'])->not->toBeNull();
    expect(fn () => goodsApplyRequirements($this, $request))->toThrow(DomainException::class, 'unavailable document type');
    expect($request->documentChecks()->count())->toBe(1)->and($request->fresh()->version)->toBe(1);
});

it('rolls back checklist changes when auditing fails', function () {
    $request = goodsRequest($this);
    goodsRequirement($this, 'id');
    $dispatcher = Activity::getEventDispatcher();
    Activity::setEventDispatcher(clone $dispatcher);
    try {
        Activity::creating(function ($entry) {
            if ($entry->description === 'Applied updated goods document requirements') {
                throw new RuntimeException('Audit failure');
            }
        });
        expect(fn () => goodsApplyRequirements($this, $request))->toThrow(RuntimeException::class, 'Audit failure');
    } finally {
        Activity::setEventDispatcher($dispatcher);
    }
    expect($request->documentChecks()->count())->toBe(0)->and($request->fresh()->version)->toBe(1);
});

it('defaults document checks to active in the original schema without an application-supplied value', function () {
    goodsRequirement($this, 'id');
    $request = goodsRequest($this);
    $check = $request->documentChecks()->first();
    $check->update(['status' => 'verified', 'checked_at' => now(), 'checked_by_user_id' => $this->actor->id]);
    $attributes = $check->fresh()->getAttributes();
    unset($attributes['is_active']);
    $attributes['id'] = (string) Str::ulid();
    $attributes['document_key'] = 'schema-default';
    DB::table('gd_distribution_document_checks')->insert($attributes);
    $created = $check->newQuery()->findOrFail($attributes['id']);
    expect($created->is_active)->toBeTrue()->and($request->fresh()->version)->toBe(1);
    expect($created->only(['status', 'checked_at', 'checked_by_user_id']))->toEqual($check->only(['status', 'checked_at', 'checked_by_user_id']));
    expect($created->getRawOriginal('updated_at'))->toBe($attributes['updated_at']);
});

it('exposes reviewed diffs only on the documents tab and enforces API validation permissions and tenant scope', function () {
    $this->withoutVite();
    $request = goodsRequest($this);
    goodsRequirement($this, 'id');
    goodsInventoryHttp($this, ['goods_distribution.requests.view']);
    $page = '/inventory-test/goods-distribution/distribution/'.$request->id;
    $url = '/api/goods-distribution/requests/'.$request->id.'/apply-requirements';
    $this->get($page.'?tab=documents', ['X-Inertia' => 'true'])->assertOk()
        ->assertJsonPath('props.requirementsUpdate.changed', true)
        ->assertJsonPath('props.requirementsUpdate.changes.0.kind', 'added');
    $this->get($page.'?tab=goods', ['X-Inertia' => 'true'])->assertOk()->assertJsonPath('props.requirementsUpdate', null);
    $data = ['version' => 1, 'operation_key' => 'api-apply', 'changes_reviewed' => true,
        'requirements_fingerprint' => app(DistributionRequirementsService::class)->preview($request)['fingerprint']];
    $this->postJson($url, $data)->assertForbidden();
    goodsInventoryHttp($this, ['goods_distribution.requests.view', 'goods_distribution.requests.process']);
    $this->postJson($url, $data)->assertForbidden();
    goodsInventoryHttp($this, ['goods_distribution.requests.view', 'goods_distribution.requests.intake']);
    $this->postJson($url, [...$data, 'changes_reviewed' => false])->assertUnprocessable()->assertJsonValidationErrors('changes_reviewed');
    $this->postJson($url, [...$data, 'requirements_fingerprint' => str_repeat('a', 64)])->assertUnprocessable();
    // Extra browser-supplied requirements cannot replace the server-resolved checklist.
    $this->postJson($url, [...$data, 'requirements' => []])->assertOk();
    $this->postJson($url, $data)->assertOk();
    expect($request->documentChecks()->count())->toBe(1)->and($request->fresh()->version)->toBe(2);
    app()->instance('municipal_id', $this->otherMunicipalId);
    $this->postJson($url, $data)->assertNotFound();
});
