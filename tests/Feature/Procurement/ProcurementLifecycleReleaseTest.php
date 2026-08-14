<?php

use App\Core\Department\Models\Department;
use App\Core\Municipality\Models\Municipality;
use App\Core\Procurement\Dto\AwardProcurementDto;
use App\Core\Procurement\Dto\CancelProcurementDto;
use App\Core\Procurement\Dto\FailureProcurementDto;
use App\Core\Procurement\Dto\OpenBiddingDto;
use App\Core\Procurement\Dto\StoreProcurementsDto;
use App\Core\Procurement\Dto\UpdateProcurementDto;
use App\Core\Procurement\Enums\ProcurementCategory;
use App\Core\Procurement\Enums\ProcurementDocumentType;
use App\Core\Procurement\Enums\ProcurementStatus;
use App\Core\Procurement\Exceptions\ProcurementComplianceException;
use App\Core\Procurement\Exceptions\ProcurementDomainException;
use App\Core\Procurement\Models\Procurement;
use App\Core\Procurement\Models\ProcurementFundingSource;
use App\Core\Procurement\UseCases\AwardProcurementUseCase;
use App\Core\Procurement\UseCases\CancelProcurementUseCase;
use App\Core\Procurement\UseCases\DeclareFailureProcurementUseCase;
use App\Core\Procurement\UseCases\DeleteProcurementUseCase;
use App\Core\Procurement\UseCases\Media\DeleteProcurementMediaUseCase;
use App\Core\Procurement\UseCases\Media\UploadProcurementMediaUseCase;
use App\Core\Procurement\UseCases\OpenBiddingUseCase;
use App\Core\Procurement\UseCases\PublishedProcurementUseCase;
use App\Core\Procurement\UseCases\StoreProcurementsUseCase;
use App\Core\Procurement\UseCases\UnpublishProcurementUseCase;
use App\Core\Procurement\UseCases\UpdateProcurementUseCase;
use App\Core\Users\Enums\EnumRoles;
use App\Core\Users\Models\User;
use Carbon\Carbon;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Spatie\Activitylog\Models\Activity;

uses(RefreshDatabase::class);

function lifecyclePdf(string $name = 'bid-document.pdf', ?int $sizeInBytes = null): UploadedFile
{
    $path = tempnam(sys_get_temp_dir(), 'procurement-lifecycle-pdf-');
    file_put_contents($path, "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF");
    if ($sizeInBytes !== null) {
        $handle = fopen($path, 'c+b');
        ftruncate($handle, $sizeInBytes);
        fclose($handle);
    }

    return new UploadedFile($path, $name, 'application/pdf', null, true);
}

function lifecycleProcurement(array $overrides = []): Procurement
{
    return Procurement::query()->create(array_merge([
        'id' => (string) Str::ulid(),
        'municipal_id' => test()->municipality->id,
        'department_id' => test()->department->id,
        'funding_source_id' => test()->fundingSource->id,
        'reference_number' => 'PHILGEPS-'.Str::upper(Str::random(10)),
        'title' => 'Municipal public works procurement',
        'description' => 'Procurement of materials and services for a defined municipal public works project.',
        'category' => ProcurementCategory::INFRASTRUCTURE,
        'status' => ProcurementStatus::DRAFT,
        'abc_amount' => 900_000,
        'published_at' => null,
    ], $overrides));
}

beforeEach(function () {
    Storage::fake(config('filesystems.default'));
    $this->seed(RoleSeeder::class);

    $this->municipality = Municipality::query()->create([
        'id' => (string) Str::ulid(),
        'name' => 'Gasan',
        'slug' => 'gasan-4905',
        'municipal_code' => '4905',
        'psgc_municipal_id' => '174003000',
        'zip_code' => '4905',
        'is_active' => true,
    ]);

    $this->department = Department::query()->create([
        'id' => (string) Str::ulid(),
        'municipal_id' => $this->municipality->id,
        'name' => 'Municipal Engineering Office',
        'code' => 'MEO',
        'is_active' => true,
    ]);

    $this->fundingSource = ProcurementFundingSource::query()->create([
        'name' => 'General Fund',
        'code' => 'GF',
        'type' => 'General',
        'is_active' => true,
    ]);

    $this->admin = User::factory()->create(['municipal_id' => $this->municipality->id]);
    $this->admin->assignRole(EnumRoles::ADMIN->value);
});

it('moves a complete draft to open privately and publishes it only through the explicit action', function () {
    $procurement = lifecycleProcurement();
    $dto = new OpenBiddingDto(
        procurementId: $procurement->id,
        municipalId: $this->municipality->id,
        abcAmount: 900_000,
        preBidDate: Carbon::now()->addDay(),
        closingDate: Carbon::now()->addDays(15),
        referenceNumber: $procurement->reference_number,
    );

    app(OpenBiddingUseCase::class)->execute($this->municipality->id, $procurement->id, $dto);

    expect($procurement->fresh()->status)->toBe(ProcurementStatus::OPEN)
        ->and($procurement->fresh()->published_at)->toBeNull()
        ->and($procurement->fresh()->media()->count())->toBe(0);

    app(PublishedProcurementUseCase::class)->execute($this->municipality->id, $procurement->id);

    expect($procurement->fresh()->status)->toBe(ProcurementStatus::OPEN)
        ->and($procurement->fresh()->published_at)->not->toBeNull();
});

it('allows lifecycle processing to continue while the record remains private', function () {
    $procurement = lifecycleProcurement([
        'status' => ProcurementStatus::OPEN,
        'closing_date' => now()->subDay(),
        'published_at' => null,
    ]);

    app(\App\Core\Procurement\UseCases\EvaluateProcurementUseCase::class)->execute(
        $this->municipality->id,
        $procurement->id,
        'Private workflow review completed.',
    );

    app(AwardProcurementUseCase::class)->execute(new AwardProcurementDto(
        municipalId: $this->municipality->id,
        procurementId: $procurement->id,
        winnerName: 'Qualified Supplier Inc.',
        contractAmount: 850_000,
        awardedDate: now()->toDateString(),
    ));

    expect($procurement->fresh()->status)->toBe(ProcurementStatus::AWARDED)
        ->and($procurement->fresh()->published_at)->toBeNull();

    app(PublishedProcurementUseCase::class)->execute($this->municipality->id, $procurement->id);

    expect($procurement->fresh()->status)->toBe(ProcurementStatus::AWARDED)
        ->and($procurement->fresh()->published_at)->not->toBeNull();
});

it('publishes a reviewed historical award without changing its outcome status', function () {
    $procurement = lifecycleProcurement([
        'status' => ProcurementStatus::AWARDED,
        'abc_amount' => 500_000,
        'contract_amount' => 475_000,
        'winning_bidder_name' => 'Qualified Supplier Inc.',
        'pre_bid_date' => now()->subDays(30),
        'closing_date' => now()->subDays(15),
        'awarded_date' => now()->subDays(5),
    ]);
    app(PublishedProcurementUseCase::class)->execute($this->municipality->id, $procurement->id);

    expect($procurement->fresh()->status)->toBe(ProcurementStatus::AWARDED)
        ->and($procurement->fresh()->published_at)->not->toBeNull()
        ->and($procurement->fresh()->media()->count())->toBe(0);
});

it('rejects historical publication when required citizen context is incomplete', function () {
    $withoutDescription = lifecycleProcurement([
        'status' => ProcurementStatus::EVALUATING,
        'description' => null,
        'closing_date' => now()->subDay(),
    ]);
    expect(fn () => app(PublishedProcurementUseCase::class)->execute($this->municipality->id, $withoutDescription->id))
        ->toThrow(ProcurementComplianceException::class, 'description');

    expect($withoutDescription->fresh()->published_at)->toBeNull();
});

it('rejects a custom funding label unless the active funding source is Others', function () {
    $legacyRecord = lifecycleProcurement([
        'status' => ProcurementStatus::EVALUATING,
        'closing_date' => now()->subDay(),
        'custom_funding_source' => 'Legacy source label that conflicts with General Fund',
    ]);
    $legacyRecord->addMedia(lifecyclePdf())->toMediaCollection(ProcurementDocumentType::BID_DOCS->value);

    expect(fn () => app(PublishedProcurementUseCase::class)->execute($this->municipality->id, $legacyRecord->id))
        ->toThrow(ProcurementComplianceException::class, 'only allowed when Others is selected');

    expect($legacyRecord->fresh()->published_at)->toBeNull();
});

it('enforces the ABC and expected current state when awarding', function () {
    $procurement = lifecycleProcurement([
        'status' => ProcurementStatus::EVALUATING,
        'abc_amount' => 100_000,
        'closing_date' => now()->subDay(),
    ]);

    $overBudget = new AwardProcurementDto(
        municipalId: $this->municipality->id,
        procurementId: $procurement->id,
        winnerName: 'Qualified Supplier Inc.',
        contractAmount: 100_001,
        awardedDate: now()->toDateString(),
    );

    expect(fn () => app(AwardProcurementUseCase::class)->execute($overBudget))
        ->toThrow(ProcurementDomainException::class, 'cannot exceed the ABC');
    expect($procurement->fresh()->status)->toBe(ProcurementStatus::EVALUATING);

    $validAward = new AwardProcurementDto(
        municipalId: $this->municipality->id,
        procurementId: $procurement->id,
        winnerName: 'Qualified Supplier Inc.',
        contractAmount: 95_000,
        awardedDate: now()->toDateString(),
    );
    app(AwardProcurementUseCase::class)->execute($validAward);

    expect($procurement->fresh()->status)->toBe(ProcurementStatus::AWARDED)
        ->and($procurement->fresh()->contract_amount)->toBe(95_000.0);

    expect(fn () => app(AwardProcurementUseCase::class)->execute($validAward))
        ->toThrow(ProcurementDomainException::class, 'Cannot move');
});

it('requires award dates to be strictly after closing for live and historical records', function () {
    $closing = now()->subDay()->startOfDay();
    $live = lifecycleProcurement([
        'status' => ProcurementStatus::EVALUATING,
        'abc_amount' => 100_000,
        'closing_date' => $closing,
    ]);

    expect(fn () => app(AwardProcurementUseCase::class)->execute(new AwardProcurementDto(
        municipalId: $this->municipality->id,
        procurementId: $live->id,
        winnerName: 'Qualified Supplier Inc.',
        contractAmount: 95_000,
        awardedDate: $closing->toDateTimeString(),
    )))->toThrow(ProcurementDomainException::class, 'must be after');

    $historical = lifecycleProcurement([
        'status' => ProcurementStatus::AWARDED,
        'abc_amount' => 100_000,
        'contract_amount' => 95_000,
        'winning_bidder_name' => 'Historical Supplier Inc.',
        'closing_date' => $closing,
        'awarded_date' => $closing,
    ]);
    $historical->addMedia(lifecyclePdf())->toMediaCollection(ProcurementDocumentType::BID_DOCS->value);

    expect(fn () => app(PublishedProcurementUseCase::class)->execute($this->municipality->id, $historical->id))
        ->toThrow(ProcurementDomainException::class, 'must be after');

    $this->actingAs($this->admin)
        ->postJson(route('procurement.store'), [
            'is_historical' => true,
            'department_id' => $this->department->id,
            'funding_source_id' => $this->fundingSource->id,
            'reference_number' => 'PHILGEPS-EQUAL-AWARD-DATE',
            'title' => 'Historical procurement with an invalid award date',
            'description' => 'Historical procurement submitted to exercise the request validation boundary.',
            'category' => ProcurementCategory::GOODS->value,
            'status' => ProcurementStatus::AWARDED->value,
            'abc_amount' => 100_000,
            'contract_amount' => 95_000,
            'winning_bidder' => 'Historical Supplier Inc.',
            'closing_date' => $closing->toDateString(),
            'awarded_date' => $closing->toDateString(),
        ], ['X-Municipality-Slug' => $this->municipality->slug])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('awarded_date');

    expect($live->fresh()->status)->toBe(ProcurementStatus::EVALUATING)
        ->and($historical->fresh()->published_at)->toBeNull();
});

it('records failure and cancellation through controlled terminal transitions', function () {
    $failed = lifecycleProcurement([
        'status' => ProcurementStatus::OPEN,
        'closing_date' => now()->subDay(),
    ]);
    app(DeclareFailureProcurementUseCase::class)->execute(new FailureProcurementDto(
        municipalId: $this->municipality->id,
        procurementId: $failed->id,
        reason: 'No responsive bids were received.',
        failedDate: now()->toDateString(),
    ));

    expect($failed->fresh()->status)->toBe(ProcurementStatus::FAILED)
        ->and($failed->fresh()->failure_reason)->toBe('No responsive bids were received.')
        ->and($failed->fresh()->failed_date?->toDateString())->toBe(now()->toDateString());

    $cancelled = lifecycleProcurement([
        'status' => ProcurementStatus::EVALUATING,
        'closing_date' => now()->subDay(),
        'notes' => 'Internal note that must be replaced.',
    ]);
    app(CancelProcurementUseCase::class)->execute(new CancelProcurementDto(
        municipalId: $this->municipality->id,
        procurementId: $cancelled->id,
        reason: 'The funding authority was formally withdrawn.',
    ));

    expect($cancelled->fresh()->status)->toBe(ProcurementStatus::CANCELLED)
        ->and($cancelled->fresh()->notes)->toBe('The funding authority was formally withdrawn.')
        ->and($cancelled->fresh()->failure_reason)->toBeNull();
});

it('keeps evaluation remarks out of notes and records them in the activity log', function () {
    $procurement = lifecycleProcurement([
        'status' => ProcurementStatus::OPEN,
        'closing_date' => now()->subDay(),
        'notes' => 'Existing internal record note.',
    ]);

    $this->actingAs($this->admin);
    app(\App\Core\Procurement\UseCases\EvaluateProcurementUseCase::class)->execute(
        $this->municipality->id,
        $procurement->id,
        'Evaluation formally started after bid closing.',
    );

    $activity = Activity::query()
        ->where('subject_type', $procurement->getMorphClass())
        ->where('subject_id', $procurement->id)
        ->where('event', 'evaluation_started')
        ->latest('id')
        ->first();

    expect($procurement->fresh()->status)->toBe(ProcurementStatus::EVALUATING)
        ->and($procurement->fresh()->notes)->toBe('Existing internal record note.')
        ->and($activity)->not->toBeNull()
        ->and($activity?->properties->get('remarks'))->toBe('Evaluation formally started after bid closing.');
});

it('allows an admin to delete any unpublished mistaken record', function () {
    $historicalMistake = lifecycleProcurement([
        'status' => ProcurementStatus::AWARDED,
        'contract_amount' => 850_000,
        'winning_bidder_name' => 'Mistaken Supplier Entry',
        'closing_date' => now()->subDays(10),
        'awarded_date' => now()->subDays(5),
        'published_at' => null,
    ]);

    app(DeleteProcurementUseCase::class)->execute($this->municipality->id, $historicalMistake->id);

    expect(Procurement::query()->whereKey($historicalMistake->id)->exists())->toBeFalse()
        ->and(Procurement::withTrashed()->whereKey($historicalMistake->id)->exists())->toBeTrue();
});

it('locks generic edits, record deletion, and evidence deletion after publication', function () {
    $procurement = lifecycleProcurement([
        'status' => ProcurementStatus::OPEN,
        'published_at' => now()->subDay(),
        'closing_date' => now()->addDays(5),
    ]);
    $media = $procurement->addMedia(lifecyclePdf())->toMediaCollection(ProcurementDocumentType::BID_DOCS->value);

    expect(fn () => app(DeleteProcurementUseCase::class)->execute($this->municipality->id, $procurement->id))
        ->toThrow(ProcurementDomainException::class, 'cannot be deleted');
    expect(fn () => app(DeleteProcurementMediaUseCase::class)->execute($procurement->id, $this->municipality->id, (string) $media->id))
        ->toThrow(ProcurementDomainException::class, 'cannot be deleted');

    $update = new UpdateProcurementDto(
        municipalId: $this->municipality->id,
        departmentId: $this->department->id,
        fundingSourceId: $this->fundingSource->id,
        customFundingSource: null,
        referenceNumber: $procurement->reference_number,
        title: 'Silently rewritten title',
        description: $procurement->description,
        category: ProcurementCategory::INFRASTRUCTURE,
        status: ProcurementStatus::OPEN,
        isHistorical: false,
        abcAmount: 900_000,
        contractAmount: null,
        winningBidder: null,
        preBidDate: null,
        closingDate: now()->addDays(5)->toDateTimeString(),
        awardDate: null,
        failureReason: null,
        failedDate: null,
        notes: null,
    );

    expect(fn () => app(UpdateProcurementUseCase::class)->execute($update, $procurement->id))
        ->toThrow(ProcurementDomainException::class, 'locked');

    expect($procurement->fresh()->title)->not->toBe('Silently rewritten title')
        ->and(Procurement::query()->whereKey($procurement->id)->exists())->toBeTrue()
        ->and($procurement->media()->whereKey($media->id)->exists())->toBeTrue();
});

it('persists creation attachments and requires unpublishing before adding historical documents', function () {
    $stored = app(StoreProcurementsUseCase::class)->execute(new StoreProcurementsDto(
        createdBy: $this->admin->id,
        municipalId: $this->municipality->id,
        departmentId: $this->department->id,
        fundingSourceId: $this->fundingSource->id,
        customFundingSource: null,
        referenceNumber: null,
        title: 'Draft with an uploaded invitation',
        description: 'Purchase of basic municipal operating supplies.',
        category: ProcurementCategory::GOODS,
        status: ProcurementStatus::DRAFT,
        abcAmount: 10_000,
        contractAmount: null,
        winningBidder: null,
        preBidDate: null,
        closingDate: null,
        awardDate: null,
        failureReason: null,
        failedDate: null,
        notes: null,
        documents: [[
            'file' => lifecyclePdf('creation-invitation.pdf'),
            'type' => ProcurementDocumentType::INVITATION->value,
        ]],
    ));

    expect($stored->description)->toBe('Purchase of basic municipal operating supplies.')
        ->and($stored->media()->where('collection_name', ProcurementDocumentType::INVITATION->value)->exists())->toBeTrue();

    $historicalAward = lifecycleProcurement([
        'status' => ProcurementStatus::AWARDED,
        'contract_amount' => 850_000,
        'winning_bidder_name' => 'Historical Supplier',
        'closing_date' => now()->subDays(10),
        'awarded_date' => now()->subDays(5),
    ]);
    app(PublishedProcurementUseCase::class)->execute($this->municipality->id, $historicalAward->id);

    expect(fn () => app(UploadProcurementMediaUseCase::class)->execute(
        $historicalAward->id,
        $this->municipality->id,
        lifecyclePdf('historical-bid.pdf'),
        ProcurementDocumentType::BID_DOCS,
    ))->toThrow(ProcurementDomainException::class, 'Unpublish');

    $this->actingAs($this->admin);
    app(UnpublishProcurementUseCase::class)->execute(
        $this->municipality->id,
        $historicalAward->id,
        'Attach the corrected historical bidding document.',
    );

    app(UploadProcurementMediaUseCase::class)->execute(
        $historicalAward->id,
        $this->municipality->id,
        lifecyclePdf('historical-bid.pdf'),
        ProcurementDocumentType::BID_DOCS,
    );

    expect($historicalAward->fresh()->published_at)->toBeNull()
        ->and($historicalAward->media()->where('collection_name', ProcurementDocumentType::BID_DOCS->value)->exists())->toBeTrue();
});

it('unpublishes a public record for audited corrections and allows it to be republished', function () {
    $procurement = lifecycleProcurement([
        'status' => ProcurementStatus::OPEN,
        'published_at' => now()->subDay(),
        'closing_date' => now()->addDays(10),
    ]);
    $media = $procurement->addMedia(lifecyclePdf('incorrect-public-document.pdf'))
        ->toMediaCollection(ProcurementDocumentType::BID_DOCS->value);
    $headers = [
        'X-Inertia' => 'true',
        'X-Municipality-Slug' => $this->municipality->slug,
    ];

    $this->get(route('transparency.show', [
        'municipality' => $this->municipality->slug,
        'procurementId' => $procurement->id,
    ]))->assertOk();
    $this->get(route('transparency.document', [
        'municipality' => $this->municipality->slug,
        'procurementId' => $procurement->id,
        'mediaId' => $media->id,
    ]))->assertOk();

    $this->actingAs($this->admin)
        ->from("/{$this->municipality->slug}/procurements/view/{$procurement->id}")
        ->patch(route('procurement.unpublish', ['procurementId' => $procurement->id]), [
            'correction_reason' => 'The public PDF contained confidential contact information.',
        ], $headers)
        ->assertRedirect()
        ->assertSessionHas('success')
        ->assertSessionHasNoErrors();

    expect($procurement->fresh()->status)->toBe(ProcurementStatus::OPEN)
        ->and($procurement->fresh()->published_at)->toBeNull();

    $activity = Activity::query()
        ->where('subject_type', $procurement->getMorphClass())
        ->where('subject_id', $procurement->id)
        ->where('event', 'unpublished_for_correction')
        ->latest('id')
        ->first();

    expect($activity)->not->toBeNull()
        ->and($activity?->properties->get('reason'))->toBe('The public PDF contained confidential contact information.')
        ->and($activity?->properties->get('previous_published_at'))->not->toBeNull();

    $this->get(route('transparency.show', [
        'municipality' => $this->municipality->slug,
        'procurementId' => $procurement->id,
    ]))->assertNotFound();
    $this->get(route('transparency.document', [
        'municipality' => $this->municipality->slug,
        'procurementId' => $procurement->id,
        'mediaId' => $media->id,
    ]))->assertNotFound();

    app(DeleteProcurementMediaUseCase::class)->execute(
        $procurement->id,
        $this->municipality->id,
        (string) $media->id,
    );
    app(PublishedProcurementUseCase::class)->execute($this->municipality->id, $procurement->id);

    expect($procurement->fresh()->published_at)->not->toBeNull()
        ->and($procurement->media()->whereKey($media->id)->exists())->toBeFalse();
});

it('blocks lifecycle and document changes until a published record is unpublished', function () {
    $publishedOpen = lifecycleProcurement([
        'status' => ProcurementStatus::OPEN,
        'published_at' => now()->subDay(),
        'closing_date' => now()->subDay(),
    ]);

    expect(fn () => app(\App\Core\Procurement\UseCases\EvaluateProcurementUseCase::class)->execute(
        $this->municipality->id,
        $publishedOpen->id,
    ))->toThrow(ProcurementDomainException::class, 'Unpublish');

    expect(fn () => app(DeclareFailureProcurementUseCase::class)->execute(new FailureProcurementDto(
        municipalId: $this->municipality->id,
        procurementId: $publishedOpen->id,
        reason: 'No responsive bids were received.',
        failedDate: now()->toDateString(),
    )))->toThrow(ProcurementDomainException::class, 'Unpublish');

    expect(fn () => app(CancelProcurementUseCase::class)->execute(new CancelProcurementDto(
        municipalId: $this->municipality->id,
        procurementId: $publishedOpen->id,
        reason: 'Funding was withdrawn.',
    )))->toThrow(ProcurementDomainException::class, 'Unpublish');

    expect(fn () => app(UploadProcurementMediaUseCase::class)->execute(
        $publishedOpen->id,
        $this->municipality->id,
        lifecyclePdf('replacement.pdf'),
        ProcurementDocumentType::BID_DOCS,
    ))->toThrow(ProcurementDomainException::class, 'Unpublish');

    $publishedEvaluation = lifecycleProcurement([
        'status' => ProcurementStatus::EVALUATING,
        'published_at' => now()->subDay(),
        'closing_date' => now()->subDays(2),
    ]);

    expect(fn () => app(AwardProcurementUseCase::class)->execute(new AwardProcurementDto(
        municipalId: $this->municipality->id,
        procurementId: $publishedEvaluation->id,
        winnerName: 'Qualified Supplier Inc.',
        contractAmount: 850_000,
        awardedDate: now()->subDay()->toDateString(),
    )))->toThrow(ProcurementDomainException::class, 'Unpublish');
});

it('rejects cross-municipality departments and inactive funding sources at the API boundary', function () {
    $otherMunicipality = Municipality::query()->create([
        'id' => (string) Str::ulid(),
        'name' => 'Boac',
        'slug' => 'boac-4900',
        'municipal_code' => '4900',
        'psgc_municipal_id' => '174001000',
        'zip_code' => '4900',
        'is_active' => true,
    ]);
    $otherDepartment = Department::query()->create([
        'id' => (string) Str::ulid(),
        'municipal_id' => $otherMunicipality->id,
        'name' => 'Other Municipality Office',
        'code' => 'OMO',
        'is_active' => true,
    ]);
    $inactiveFunding = ProcurementFundingSource::query()->create([
        'name' => 'Inactive Fund',
        'code' => 'OLD',
        'type' => 'General',
        'is_active' => false,
    ]);
    $basePayload = [
        'is_historical' => false,
        'department_id' => $this->department->id,
        'funding_source_id' => $this->fundingSource->id,
        'title' => 'Validation boundary procurement',
        'category' => ProcurementCategory::GOODS->value,
        'abc_amount' => 0,
    ];
    $headers = ['X-Municipality-Slug' => $this->municipality->slug];

    $this->actingAs($this->admin)
        ->postJson(route('procurement.store'), [
            ...$basePayload,
            'department_id' => $otherDepartment->id,
        ], $headers)
        ->assertUnprocessable()
        ->assertJsonValidationErrors('department_id');

    $this->postJson(route('procurement.store'), [
        ...$basePayload,
        'funding_source_id' => $inactiveFunding->id,
    ], $headers)
        ->assertUnprocessable()
        ->assertJsonValidationErrors('funding_source_id');
});

it('validates document type and the unified 25 MB upload limit at the API boundary', function () {
    $procurement = lifecycleProcurement();
    $headers = [
        'Accept' => 'application/json',
        'X-Municipality-Slug' => $this->municipality->slug,
    ];

    $this->actingAs($this->admin)
        ->post(route('procurement.media.upload', ['procurementId' => $procurement->id]), [
            'file' => lifecyclePdf('invalid-type.pdf'),
            'type' => 'not_a_procurement_document_type',
        ], $headers)
        ->assertUnprocessable()
        ->assertJsonValidationErrors('type');

    $this->post(route('procurement.media.upload', ['procurementId' => $procurement->id]), [
        'file' => lifecyclePdf('oversized.pdf', (25 * 1024 * 1024) + 1),
        'type' => ProcurementDocumentType::BID_DOCS->value,
    ], $headers)
        ->assertUnprocessable()
        ->assertJsonValidationErrors('file');
});

it('returns procurement domain failures to inertia forms instead of closing lifecycle dialogs as successful', function () {
    $headers = [
        'X-Inertia' => 'true',
        'X-Municipality-Slug' => $this->municipality->slug,
    ];

    $historical = lifecycleProcurement([
        'status' => ProcurementStatus::EVALUATING,
        'description' => null,
        'closing_date' => now()->subDay(),
    ]);
    $historical->addMedia(lifecyclePdf())->toMediaCollection(ProcurementDocumentType::BID_DOCS->value);

    $this->actingAs($this->admin)
        ->from("/{$this->municipality->slug}/procurements/view/{$historical->id}")
        ->patch(route('procurement.publish', ['procurementId' => $historical->id]), [], $headers)
        ->assertRedirect()
        ->assertSessionHasErrors([
            'procurement' => 'A plain-language project description is required before publication.',
        ])
        ->assertSessionMissing('success');

    expect($historical->fresh()->published_at)->toBeNull();

    $cancelledFromInvalidState = lifecycleProcurement([
        'status' => ProcurementStatus::AWARDED,
        'published_at' => now()->subDay(),
        'closing_date' => now()->subDays(2),
        'awarded_date' => now()->subDay(),
        'winning_bidder_name' => 'Qualified Supplier Inc.',
        'contract_amount' => 850_000,
    ]);

    $this->from("/{$this->municipality->slug}/procurements/view/{$cancelledFromInvalidState->id}")
        ->patch(route('procurement.cancel', ['procurementId' => $cancelledFromInvalidState->id]), [
            'cancellation_reason' => 'The funding authority was formally withdrawn.',
        ], $headers)
        ->assertRedirect()
        ->assertSessionHasErrors('procurement')
        ->assertSessionMissing('success');

    expect($cancelledFromInvalidState->fresh()->status)->toBe(ProcurementStatus::AWARDED);

    $openBeforeDeadline = lifecycleProcurement([
        'status' => ProcurementStatus::OPEN,
        'closing_date' => now()->addDay(),
    ]);

    $this->from("/{$this->municipality->slug}/procurements/view/{$openBeforeDeadline->id}")
        ->patch(route('procurement.evaluate', ['procurementId' => $openBeforeDeadline->id]), [], $headers)
        ->assertRedirect()
        ->assertSessionHasErrors('procurement')
        ->assertSessionMissing('success');

    expect($openBeforeDeadline->fresh()->status)->toBe(ProcurementStatus::OPEN);
});
