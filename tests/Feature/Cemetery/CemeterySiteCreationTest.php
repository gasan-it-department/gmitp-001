<?php

use App\Core\Cemetery\Enums\CemeterySiteStatus;
use App\Core\Cemetery\Models\CemeterySite;
use App\Core\Municipality\Models\Municipality;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Activitylog\Models\Activity;

beforeEach(function () {
    Schema::create('municipalities', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->string('psgc_municipal_id')->nullable();
        $table->string('name');
        $table->string('slug')->unique();
        $table->string('municipal_code')->unique();
        $table->boolean('is_active')->default(false);
        $table->string('zip_code')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });
    Schema::create('psgc_barangays', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('municipality_id');
        $table->string('psgc_code', 20)->unique();
        $table->string('name');
    });
    Schema::create('activity_log', function (Blueprint $table) {
        $table->id();
        $table->string('log_name')->nullable()->index();
        $table->text('description');
        $table->nullableUlidMorphs('subject', 'subject');
        $table->string('event')->nullable();
        $table->nullableUlidMorphs('causer', 'causer');
        $table->json('attribute_changes')->nullable();
        $table->json('properties')->nullable();
        $table->timestamps();
    });

    $this->siteMigration = require database_path('migrations/2026_06_14_000002_create_cemetery_sites_table.php');
    $this->siteMigration->up();

    DB::table('psgc_barangays')->insert([
        [
            'id' => 1,
            'municipality_id' => 1,
            'psgc_code' => '174003001',
            'name' => 'ANTIPOLO',
        ],
        [
            'id' => 2,
            'municipality_id' => 2,
            'psgc_code' => '174001001',
            'name' => 'AGOT',
        ],
    ]);

    $this->gasan = Municipality::query()->create([
        'id' => (string) Str::ulid(),
        'psgc_municipal_id' => '1',
        'name' => 'Gasan',
        'slug' => 'gasan',
        'municipal_code' => 'GAS',
        'is_active' => true,
        'zip_code' => '4905',
    ]);
    $this->boac = Municipality::query()->create([
        'id' => (string) Str::ulid(),
        'psgc_municipal_id' => '2',
        'name' => 'Boac',
        'slug' => 'boac',
        'municipal_code' => 'BOA',
        'is_active' => true,
        'zip_code' => '4900',
    ]);

    cemeterySiteContext($this->gasan);
    $this->withoutMiddleware();
});

afterEach(function () {
    $this->siteMigration->down();
    Schema::dropIfExists('activity_log');
    Schema::dropIfExists('psgc_barangays');
    Schema::dropIfExists('municipalities');
});

it('renders the Cemetery Site creation page', function () {
    $this->get(route('cemetery.admin.sites.create.page', [
        'municipality' => $this->gasan->slug,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Cemetery/Admin/Site/Create/CreateCemeterySite')
            ->where('municipality.id', $this->gasan->id)
            ->where('municipality.psgc_municipal_id', '1'));
});

it('creates an active tenant-owned Site with normalized fields and an audit event', function () {
    $response = $this->post(route('cemetery-sites.store'), [
        'name' => '  Gasan Central Cemetery ',
        'psgc_barangay_code' => '174003001',
        'street_name' => '  cemetery road ',
        'notes' => '  Near the municipal boundary.  ',
        'municipal_id' => $this->boac->id,
        'status' => 'closed',
    ]);

    $site = CemeterySite::query()->sole();

    $response->assertRedirect(route('cemetery.admin.sites.list.page', [
        'municipality' => $this->gasan->slug,
    ]));

    expect(Str::isUlid($site->id))->toBeTrue()
        ->and($site->municipal_id)->toBe($this->gasan->id)
        ->and($site->name)->toBe('GASAN CENTRAL CEMETERY')
        ->and($site->psgc_barangay_code)->toBe('174003001')
        ->and($site->street_name)->toBe('CEMETERY ROAD')
        ->and($site->notes)->toBe('Near the municipal boundary.')
        ->and($site->status)->toBe(CemeterySiteStatus::ACTIVE)
        ->and(Activity::query()
            ->where('log_name', 'cemetery_site')
            ->where('subject_type', 'cemetery_site')
            ->where('subject_id', $site->id)
            ->where('event', 'created')
            ->exists())->toBeTrue();
});

it('keeps normalized Site names unique per municipality and reusable across municipalities', function () {
    $payload = [
        'name' => 'Central Cemetery',
        'psgc_barangay_code' => '174003001',
    ];

    $this->post(route('cemetery-sites.store'), $payload)->assertSessionHasNoErrors();
    $this->post(route('cemetery-sites.store'), [
        ...$payload,
        'name' => ' central cemetery ',
    ])->assertSessionHasErrors('name');

    session()->flush();
    cemeterySiteContext($this->boac);
    $this->post(route('cemetery-sites.store'), [
        'name' => 'Central Cemetery',
        'psgc_barangay_code' => '174001001',
    ])->assertSessionHasNoErrors();

    expect(CemeterySite::query()->where('name', 'CENTRAL CEMETERY')->count())->toBe(2);
});

it('rejects a barangay outside the current municipality', function () {
    $this->post(route('cemetery-sites.store'), [
        'name' => 'Gasan Memorial Site',
        'psgc_barangay_code' => '174001001',
    ])
        ->assertSessionHasErrors('psgc_barangay_code');

    expect(CemeterySite::query()->exists())->toBeFalse();
});

it('validates required fields and storage length limits', function () {
    $this->post(route('cemetery-sites.store'), [
        'name' => '',
        'street_name' => str_repeat('A', 151),
        'notes' => str_repeat('N', 2001),
    ])->assertSessionHasErrors([
        'name',
        'street_name',
        'notes',
    ]);

    session()->flush();

    $this->post(route('cemetery-sites.store'), [
        'name' => str_repeat('C', 256),
    ])->assertSessionHasErrors('name');

    expect(CemeterySite::query()->exists())->toBeFalse();
});

it('declares the required authentication, admin, tenant, and module middleware', function () {
    $webMiddleware = Route::getRoutes()
        ->getByName('cemetery.admin.sites.create.page')
        ?->gatherMiddleware() ?? [];
    $storeMiddleware = Route::getRoutes()
        ->getByName('cemetery-sites.store')
        ?->gatherMiddleware() ?? [];

    expect($webMiddleware)->toContain('auth', 'municipalityContext', 'admin', 'permission:cemetery.access')
        ->and($storeMiddleware)->toContain('auth', 'municipalityContext', 'admin', 'permission:cemetery.access');
});

function cemeterySiteContext(Municipality $municipality): void
{
    app()->instance('municipal_id', $municipality->id);
    app()->instance('current_municipality', $municipality);
}
