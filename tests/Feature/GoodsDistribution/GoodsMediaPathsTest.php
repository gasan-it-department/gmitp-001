<?php

use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\GoodsDistribution\Actions\ReviewDistributionDocumentAction;
use App\Core\GoodsDistribution\Actions\UploadBulkDispatchEvidenceAction;
use App\Core\GoodsDistribution\Dto\BulkDispatchDto;
use App\Core\GoodsDistribution\Dto\DistributionRequestDto;
use App\Core\GoodsDistribution\Models\BulkDispatch;
use App\Core\GoodsDistribution\Models\DistributionRequest;
use App\External\Documents\ActionCenter\MediaLibrary\ActionCenterPathGenerator;
use App\External\Documents\GoodsDistribution\MediaLibrary\GoodsDistributionPathGenerator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Spatie\Activitylog\Models\Activity;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\MediaLibrary\Support\PathGenerator\DefaultPathGenerator;
use Spatie\MediaLibrary\Support\PathGenerator\PathGeneratorFactory;

require_once __DIR__.'/../../Support/BulkDispatchFixture.php';

beforeEach(function () {
    $this->withoutVite();
    bulkFixture($this);
});
afterEach(fn () => goodsDistributionCleanup());

dataset('goods media owners', ['request', 'bulk']);
dataset('goods media disks', ['local', 'public', 's3']);

function goodsMediaPdf(): UploadedFile
{
    return UploadedFile::fake()->createWithContent('proof.pdf', "%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF");
}

function goodsMediaRecord(object $test, string $kind): DistributionRequest|BulkDispatch
{
    return $kind === 'request' ? goodsRequest($test) : bulkDraft($test);
}

function goodsMediaUpload(object $test, DistributionRequest|BulkDispatch $record): Media
{
    if ($record instanceof DistributionRequest) {
        $check = $record->documentChecks()->first() ?? $record->documentChecks()->create(['municipal_id' => $test->municipalId,
            'document_key' => 'id', 'label' => 'ID', 'evidence_mode' => 'upload', 'physical_copy_requirement' => 'unspecified',
            'is_required' => true, 'sort_order' => 0]);
        app(ReviewDistributionDocumentAction::class)->execute(new DistributionRequestDto($test->municipalId, $test->actor->id,
            ['version' => $record->fresh()->version], $record->id), $check->id, goodsMediaPdf());
    } else {
        app(UploadBulkDispatchEvidenceAction::class)->execute(new BulkDispatchDto($test->municipalId, $test->actor->id,
            ['version' => $record->fresh()->version, 'operation_key' => (string) Str::uuid()], $record->id), goodsMediaPdf());
    }

    return $record->media()->latest('id')->firstOrFail();
}

function goodsMediaDownloadUrl(DistributionRequest|BulkDispatch $record, Media $media): string
{
    return $record instanceof DistributionRequest
        ? '/inventory-test/goods-distribution/distribution/'.$record->id.'/documents/'.$record->documentChecks()->first()->id
        : '/inventory-test/goods-distribution/bulk-dispatches/'.$record->id.'/attachments/'.$media->id;
}

function goodsMediaHttp(object $test): void
{
    goodsInventoryHttp($test, ['goods_distribution.requests.view', 'goods_distribution.requests.intake', 'goods_distribution.requests.process',
        'goods_distribution.bulk_dispatches.view', 'goods_distribution.bulk_dispatches.prepare', 'goods_distribution.bulk_dispatches.reconcile']);
}

it('stores GD uploads under their municipality and owner using the configured media disk', function (string $kind, string $disk) {
    Storage::fake($disk);
    config(['goods_distribution.document_disk' => $disk]);
    $record = goodsMediaRecord($this, $kind);
    $version = $record->fresh()->version;
    $media = goodsMediaUpload($this, $record);
    $directory = $kind === 'request' ? 'requests' : 'bulk-dispatches';
    $collection = $kind === 'request' ? 'goods_documents' : 'bulk_dispatch_evidence';
    $base = $this->municipalId.'/goods-distribution/'.$directory.'/'.$record->id.'/'.$collection.'/'.$media->id.'/';

    expect(PathGeneratorFactory::create($media))->toBeInstanceOf(GoodsDistributionPathGenerator::class)
        ->and($media->disk)->toBe($disk)->and($media->model_type)->toBe($record->getMorphClass())
        ->and($media->getCustomProperty(GoodsDistributionPathGenerator::VERSION_PROPERTY))->toBe(1)
        ->and($media->getPathRelativeToRoot())->toBe($base.$media->file_name)
        ->and($record->fresh()->version)->toBe($version + 1);
    Storage::disk($disk)->assertExists($base.$media->file_name);
    Storage::disk($disk)->assertMissing($media->id.'/'.$media->file_name);
    $generator = PathGeneratorFactory::create($media);
    expect($generator->getPathForConversions($media))->toBe($base.'conversions/')
        ->and($generator->getPathForResponsiveImages($media))->toBe($base.'responsive-images/');
    if ($kind === 'request') {
        $check = $record->documentChecks()->first();
        expect($media->getCustomProperty('document_check_id'))->toBe($check->id)->and($check->current_media_id)->toBe($media->id);
    }
    goodsMediaHttp($this);
    $url = goodsMediaDownloadUrl($record, $media);
    $this->get($url)->assertOk()->assertDownload();
    app()->instance('municipal_id', $this->otherMunicipalId);
    if ($kind === 'request') {
        $this->get($url)->assertNotFound();
    } else {
        $this->get($url)->assertForbidden();
    }
    expect(DB::table('gd_stock_movements')->count())->toBe(0);
})->with('goods media owners')->with('goods media disks');

it('keeps old uploads and their URLs unchanged while new uploads use the GD folders', function (string $kind, string $prefix) {
    Storage::fake('public');
    config(['goods_distribution.document_disk' => 'public', 'media-library.prefix' => $prefix]);
    $record = goodsMediaRecord($this, $kind);
    $generators = config('media-library.custom_path_generators');
    $oldGenerators = $generators;
    unset($oldGenerators[DistributionRequest::class], $oldGenerators[BulkDispatch::class]);
    config(['media-library.custom_path_generators' => $oldGenerators]);
    $collection = $kind === 'request' ? 'goods_documents' : 'bulk_dispatch_evidence';
    $media = $record->addMedia(goodsMediaPdf())->toMediaCollection($collection, 'public');
    $originalPath = $media->getPathRelativeToRoot();
    $originalUrl = $media->getUrl();
    expect($originalPath)->toBe(($prefix ? $prefix.'/' : '').$media->id.'/'.$media->file_name);
    if ($kind === 'request') {
        $record->documentChecks()->create(['municipal_id' => $this->municipalId, 'document_key' => 'id', 'label' => 'ID',
            'evidence_mode' => 'upload', 'physical_copy_requirement' => 'unspecified', 'is_required' => true, 'sort_order' => 0,
            'current_media_id' => $media->id]);
    }
    config(['media-library.custom_path_generators' => $generators]);
    $media = $media->fresh();
    expect($media->getPathRelativeToRoot())->toBe($originalPath)->and($media->getUrl())->toBe($originalUrl)
        ->and($media->hasCustomProperty(GoodsDistributionPathGenerator::VERSION_PROPERTY))->toBeFalse();
    $base = dirname($originalPath).'/';
    expect(PathGeneratorFactory::create($media)->getPathForConversions($media))->toBe($base.'conversions/')
        ->and(PathGeneratorFactory::create($media)->getPathForResponsiveImages($media))->toBe($base.'responsive-images/');
    goodsMediaHttp($this);
    $this->get(goodsMediaDownloadUrl($record, $media))->assertOk()->assertDownload();
    $new = goodsMediaUpload($this, $record);
    expect($new->getPathRelativeToRoot())->toStartWith($this->municipalId.'/goods-distribution/');
    Storage::disk('public')->assertExists($originalPath);
    Storage::disk('public')->assertExists($new->getPathRelativeToRoot());
    expect($media->fresh()->getPathRelativeToRoot())->toBe($originalPath)->and($record->media()->count())->toBe(2);
})->with('goods media owners')->with(['', 'legacy-prefix']);

it('deletes only the chosen media folder and leaves other GD evidence intact', function () {
    Storage::fake('local');
    $record = bulkDraft($this);
    $first = goodsMediaUpload($this, $record);
    $second = goodsMediaUpload($this, $record);
    $firstPath = $first->getPathRelativeToRoot();
    $secondPath = $second->getPathRelativeToRoot();
    $first->delete();
    Storage::disk('local')->assertMissing($firstPath);
    Storage::disk('local')->assertExists($secondPath);
    expect($record->media()->count())->toBe(1);
});

it('cleans up namespaced files when an upload rolls back after writing the file', function (string $kind) {
    Storage::fake('local');
    $record = goodsMediaRecord($this, $kind);
    $fail = true;
    Activity::creating(function (Activity $activity) use (&$fail): void {
        if ($fail) {
            throw new RuntimeException('Simulated activity storage failure');
        }
    });
    try {
        expect(fn () => goodsMediaUpload($this, $record))->toThrow(RuntimeException::class, 'Simulated activity storage failure');
    } finally {
        $fail = false;
    }
    expect(DB::table('media')->count())->toBe(0)->and(Storage::disk('local')->allFiles())->toBe([])
        ->and($record->fresh()->version)->toBe(1);
    if ($kind === 'request') {
        expect($record->documentChecks()->first()->current_media_id)->toBeNull();
    }
})->with('goods media owners');

it('leaves the existing Action Center path generator and default generator unchanged', function () {
    $record = (new AssistanceRequest)->forceFill(['id' => (string) Str::ulid(), 'municipal_id' => $this->municipalId]);
    $media = (new Media)->forceFill(['id' => 42, 'model_type' => $record->getMorphClass(), 'model_id' => $record->id, 'collection_name' => 'documents']);
    $media->setRelation('model', $record);
    expect(PathGeneratorFactory::create($media))->toBeInstanceOf(ActionCenterPathGenerator::class)
        ->and(PathGeneratorFactory::create($media)->getPath($media))->toBe($this->municipalId.'/action-center/assistance-requests/'.$record->id.'/documents/42/')
        ->and(config('media-library.path_generator'))->toBe(DefaultPathGenerator::class);
});
