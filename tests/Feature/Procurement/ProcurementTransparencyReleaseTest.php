<?php

use App\Core\Department\Models\Department;
use App\Core\Municipality\Models\Municipality;
use App\Core\Procurement\Enums\ProcurementCategory;
use App\Core\Procurement\Enums\ProcurementStatus;
use App\Core\Procurement\Models\Procurement;
use App\Core\Procurement\Models\ProcurementFundingSource;
use App\Core\Users\Enums\EnumRoles;
use App\Core\Users\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function createTransparencyProcurement(
    Municipality $municipality,
    Department $department,
    ProcurementFundingSource $fundingSource,
    array $overrides = [],
): Procurement {
    return Procurement::query()->create(array_merge([
        'id' => (string) Str::ulid(),
        'municipal_id' => $municipality->id,
        'department_id' => $department->id,
        'funding_source_id' => $fundingSource->id,
        'reference_number' => 'PHILGEPS-'.Str::upper(Str::random(10)),
        'title' => 'Municipal road rehabilitation',
        'description' => 'Rehabilitation of priority municipal roads for safer public access.',
        'category' => ProcurementCategory::INFRASTRUCTURE,
        'status' => ProcurementStatus::DRAFT,
        'abc_amount' => 1_500_000,
        'pre_bid_date' => now()->subDays(20),
        'closing_date' => now()->subDays(5),
        'published_at' => null,
    ], $overrides));
}

function fakeProcurementPdf(string $name): UploadedFile
{
    $path = tempnam(sys_get_temp_dir(), 'procurement-pdf-');
    file_put_contents($path, "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF");

    return new UploadedFile($path, $name, 'application/pdf', null, true);
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
});

it('allows only a same-municipality admin to stream an unpublished document', function () {
    $draft = createTransparencyProcurement($this->municipality, $this->department, $this->fundingSource);
    $media = $draft->addMedia(fakeProcurementPdf('internal-bid.pdf'))
        ->toMediaCollection('bid_docs');

    $parameters = [
        'municipality' => $this->municipality->slug,
        'procurementId' => $draft->id,
        'mediaId' => $media->id,
    ];

    $this->get(route('procurement.admin.document', $parameters))
        ->assertRedirect(route('landing'));

    $otherMunicipality = Municipality::query()->create([
        'id' => (string) Str::ulid(),
        'name' => 'Boac',
        'slug' => 'boac-4900',
        'municipal_code' => '4900',
        'psgc_municipal_id' => '174001000',
        'zip_code' => '4900',
        'is_active' => true,
    ]);
    $wrongAdmin = User::factory()->create(['municipal_id' => $otherMunicipality->id]);
    $wrongAdmin->assignRole(EnumRoles::ADMIN->value);

    $this->actingAs($wrongAdmin)
        ->get(route('procurement.admin.document', $parameters))
        ->assertForbidden();

    $this->flushSession();
    $admin = User::factory()->create(['municipal_id' => $this->municipality->id]);
    $admin->assignRole(EnumRoles::ADMIN->value);

    $this->actingAs($admin)
        ->get(route('procurement.admin.document', $parameters))
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf');
});

it('guards procurement document downloads with the same publication rules as details', function () {
    $draft = createTransparencyProcurement($this->municipality, $this->department, $this->fundingSource);
    $draftMedia = $draft->addMedia(fakeProcurementPdf('draft-bid.pdf'))
        ->toMediaCollection('bid_docs');

    $this->get(route('transparency.document', [
        'municipality' => $this->municipality->slug,
        'procurementId' => $draft->id,
        'mediaId' => $draftMedia->id,
    ]))->assertNotFound();

    foreach ([null, now()->addDay()] as $publishedAt) {
        $hidden = createTransparencyProcurement($this->municipality, $this->department, $this->fundingSource, [
            'status' => ProcurementStatus::OPEN,
            'published_at' => $publishedAt,
        ]);
        $hiddenMedia = $hidden->addMedia(fakeProcurementPdf('hidden-bid.pdf'))
            ->toMediaCollection('bid_docs');

        $this->get(route('transparency.document', [
            'municipality' => $this->municipality->slug,
            'procurementId' => $hidden->id,
            'mediaId' => $hiddenMedia->id,
        ]))->assertNotFound();
    }

    $published = createTransparencyProcurement($this->municipality, $this->department, $this->fundingSource, [
        'status' => ProcurementStatus::OPEN,
        'published_at' => now()->subDay(),
    ]);
    $publicMedia = $published->addMedia(fakeProcurementPdf('public-bid.pdf'))
        ->toMediaCollection('bid_docs');

    $this->get(route('transparency.document', [
        'municipality' => $this->municipality->slug,
        'procurementId' => $published->id,
        'mediaId' => $publicMedia->id,
    ]))
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf')
        ->assertHeader('cache-control', 'max-age=0, no-store, private')
        ->assertHeader('x-content-type-options', 'nosniff');

    $otherMunicipality = Municipality::query()->create([
        'id' => (string) Str::ulid(),
        'name' => 'Boac',
        'slug' => 'boac-4900',
        'municipal_code' => '4900',
        'psgc_municipal_id' => '174001000',
        'zip_code' => '4900',
        'is_active' => true,
    ]);

    $this->get(route('transparency.document', [
        'municipality' => $otherMunicipality->slug,
        'procurementId' => $published->id,
        'mediaId' => $publicMedia->id,
    ]))->assertNotFound();
});

it('lists only records that satisfy every public visibility rule', function () {
    $published = createTransparencyProcurement(
        $this->municipality,
        $this->department,
        $this->fundingSource,
        [
            'status' => ProcurementStatus::OPEN,
            'published_at' => now()->subDay(),
        ],
    );

    createTransparencyProcurement($this->municipality, $this->department, $this->fundingSource);
    createTransparencyProcurement($this->municipality, $this->department, $this->fundingSource, [
        'status' => ProcurementStatus::OPEN,
        'published_at' => null,
    ]);
    createTransparencyProcurement($this->municipality, $this->department, $this->fundingSource, [
        'status' => ProcurementStatus::OPEN,
        'published_at' => now()->addDay(),
    ]);

    $deleted = createTransparencyProcurement($this->municipality, $this->department, $this->fundingSource, [
        'status' => ProcurementStatus::AWARDED,
        'published_at' => now()->subDay(),
        'winning_bidder_name' => 'Qualified Builder Inc.',
        'contract_amount' => 1_400_000,
        'awarded_date' => now()->subDays(2),
    ]);
    $deleted->delete();

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
        'name' => 'Boac Engineering Office',
        'code' => 'MEO',
        'is_active' => true,
    ]);
    createTransparencyProcurement($otherMunicipality, $otherDepartment, $this->fundingSource, [
        'status' => ProcurementStatus::OPEN,
        'published_at' => now()->subDay(),
    ]);

    $this->get(route('transparency.index', ['municipality' => $this->municipality->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('PublicInformation/Client/TransparencyPage')
            ->has('procurements.data', 1)
            ->where('procurements.data.0.id', $published->id)
            ->where('filterOptions.statuses', fn ($statuses) => collect($statuses)
                ->pluck('value')
                ->doesntContain(ProcurementStatus::DRAFT->value))
        );
});

it('returns 404 for every unpublished public detail variant', function () {
    $draft = createTransparencyProcurement($this->municipality, $this->department, $this->fundingSource);
    $unpublished = createTransparencyProcurement($this->municipality, $this->department, $this->fundingSource, [
        'status' => ProcurementStatus::OPEN,
        'published_at' => null,
    ]);
    $future = createTransparencyProcurement($this->municipality, $this->department, $this->fundingSource, [
        'status' => ProcurementStatus::OPEN,
        'published_at' => now()->addDay(),
    ]);
    $deleted = createTransparencyProcurement($this->municipality, $this->department, $this->fundingSource, [
        'status' => ProcurementStatus::OPEN,
        'published_at' => now()->subDay(),
    ]);
    $deleted->delete();

    foreach ([$draft, $unpublished, $future, $deleted] as $procurement) {
        $this->get(route('transparency.show', [
            'municipality' => $this->municipality->slug,
            'procurementId' => $procurement->id,
        ]))->assertNotFound();
    }

    $otherMunicipality = Municipality::query()->create([
        'id' => (string) Str::ulid(),
        'name' => 'Boac',
        'slug' => 'boac-4900',
        'municipal_code' => '4900',
        'psgc_municipal_id' => '174001000',
        'zip_code' => '4900',
        'is_active' => true,
    ]);
    $published = createTransparencyProcurement($this->municipality, $this->department, $this->fundingSource, [
        'status' => ProcurementStatus::OPEN,
        'published_at' => now()->subDay(),
    ]);

    $this->get(route('transparency.show', [
        'municipality' => $otherMunicipality->slug,
        'procurementId' => $published->id,
    ]))->assertNotFound();
});

it('searches citizen records by responsible office as advertised', function () {
    $procurement = createTransparencyProcurement($this->municipality, $this->department, $this->fundingSource, [
        'status' => ProcurementStatus::OPEN,
        'published_at' => now()->subDay(),
    ]);

    $filters = \App\Core\Procurement\Dto\ProcurementFilterDto::fromRequest([
        'search' => 'engineering OFFICE',
    ]);

    expect($filters->search)->toBe('engineering OFFICE');

    $this->get(route('transparency.index', [
        'municipality' => $this->municipality->slug,
        'search' => 'engineering OFFICE',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('procurements.data', 1)
            ->where('procurements.data.0.id', $procurement->id)
            ->where('procurements.data.0.description', $procurement->description)
            ->where('procurements.data.0.funding_source', $this->fundingSource->name)
            ->where('procurements.data.0.status_label', ProcurementStatus::OPEN->label())
        );
});

it('returns a stable citizen detail contract for a published procurement', function () {
    $procurement = createTransparencyProcurement($this->municipality, $this->department, $this->fundingSource, [
        'status' => ProcurementStatus::AWARDED,
        'published_at' => now()->subDays(10),
        'winning_bidder_name' => 'Qualified Builder Inc.',
        'contract_amount' => 1_400_000,
        'awarded_date' => now()->subDays(2),
    ]);

    $this->get(route('transparency.show', [
        'municipality' => $this->municipality->slug,
        'procurementId' => $procurement->id,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('PublicInformation/Client/Show/TransparencyDetails')
            ->where('procurement.data.id', $procurement->id)
            ->where('procurement.data.status', ProcurementStatus::AWARDED->value)
            ->where('procurement.data.status_label', ProcurementStatus::AWARDED->label())
            ->where('procurement.data.category', ProcurementCategory::INFRASTRUCTURE->value)
            ->where('procurement.data.description', $procurement->description)
            ->where('procurement.data.funding_source', $this->fundingSource->name)
            ->where('procurement.data.winning_bidder', 'Qualified Builder Inc.')
        );
});

it('serializes failed records without losing the reason or crashing on failed date', function () {
    $procurement = createTransparencyProcurement($this->municipality, $this->department, $this->fundingSource, [
        'status' => ProcurementStatus::FAILED,
        'published_at' => now()->subDay(),
        'failure_reason' => 'No responsive bids were received.',
        'failed_date' => '2026-08-10',
    ]);

    $this->get(route('transparency.index', ['municipality' => $this->municipality->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('procurements.data.0.id', $procurement->id)
            ->where('procurements.data.0.failure_reason', 'No responsive bids were received.')
        );
});

it('exposes notes as a cancellation reason only for cancelled records', function () {
    $cancelled = createTransparencyProcurement($this->municipality, $this->department, $this->fundingSource, [
        'status' => ProcurementStatus::CANCELLED,
        'published_at' => now()->subDay(),
        'notes' => 'The project was cancelled after the funding authority was withdrawn.',
    ]);

    $this->get(route('transparency.show', [
        'municipality' => $this->municipality->slug,
        'procurementId' => $cancelled->id,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('procurement.data.cancellation_reason', $cancelled->notes)
            ->missing('procurement.data.notes')
        );

    $open = createTransparencyProcurement($this->municipality, $this->department, $this->fundingSource, [
        'status' => ProcurementStatus::OPEN,
        'published_at' => now()->subDay(),
        'notes' => 'Internal BAC note that must remain private.',
    ]);

    $this->get(route('transparency.show', [
        'municipality' => $this->municipality->slug,
        'procurementId' => $open->id,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('procurement.data.cancellation_reason', null)
            ->missing('procurement.data.notes')
        );
});
