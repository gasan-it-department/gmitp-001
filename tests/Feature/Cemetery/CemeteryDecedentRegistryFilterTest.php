<?php

use App\Core\Municipality\Models\Municipality;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

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
    Schema::create('users', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->string('full_name')->nullable();
        $table->timestamps();
    });
    Schema::create('psgc_municipalities', function (Blueprint $table) {
        $table->id();
    });
    Schema::create('psgc_barangays', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('municipality_id');
        $table->string('psgc_code', 20)->unique();
        $table->string('name');
    });

    $this->migrations = [
        require database_path('migrations/2026_06_14_000001_create_cemetery_decedents_table.php'),
        require database_path('migrations/2026_06_14_000002_create_cemetery_sites_table.php'),
        require database_path('migrations/2026_06_14_000003_create_cemetery_sections_table.php'),
        require database_path('migrations/2026_06_14_000004_create_cemetery_blocks_table.php'),
        require database_path('migrations/2026_06_14_000005_create_cemetery_plots_table.php'),
        require database_path('migrations/2026_06_14_000007_create_cemetery_unidentified_details_table.php'),
        require database_path('migrations/2026_06_14_000009_create_cemetery_interments_table.php'),
        require database_path('migrations/2026_06_15_000001_add_cemetery_decedent_registration_fields.php'),
    ];

    foreach ($this->migrations as $migration) {
        $migration->up();
    }

    $this->gasan = registryFilterMunicipality('1', 'Gasan', 'gasan', 'GAS');
    $this->boac = registryFilterMunicipality('2', 'Boac', 'boac', 'BOA');

    app()->instance('municipal_id', $this->gasan->id);
    app()->instance('current_municipality', $this->gasan);

    activity()->disableLogging();
    $this->withoutMiddleware();
});

afterEach(function () {
    activity()->enableLogging();

    foreach (array_reverse($this->migrations) as $migration) {
        $migration->down();
    }

    Schema::dropIfExists('psgc_barangays');
    Schema::dropIfExists('psgc_municipalities');
    Schema::dropIfExists('users');
    Schema::dropIfExists('municipalities');
});

it('searches Decedent records case-insensitively and stays tenant scoped', function () {
    $match = registryFilterDecedent($this->gasan->id, [
        'first_name' => 'JUAN',
        'last_name' => 'SANTOS',
        'registry_number' => 'REG-2024-001',
        'date_of_death' => '2024-03-08',
    ]);
    registryFilterDecedent($this->gasan->id, [
        'first_name' => 'MARIA',
        'last_name' => 'CRUZ',
        'registry_number' => 'REG-2024-002',
        'date_of_death' => '2024-04-01',
    ]);
    registryFilterDecedent($this->boac->id, [
        'first_name' => 'JUAN',
        'last_name' => 'BOAC',
        'registry_number' => 'REG-BOAC-001',
        'date_of_death' => '2024-03-08',
    ]);

    $this->get(route('cemetery.admin.decedents.list.page', [
        'municipality' => $this->gasan->slug,
        'search' => 'juan',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Cemetery/Admin/Decedents/List/ListDecedents')
            ->where('filters.search', 'juan')
            ->has('decedents.data', 1)
            ->where('decedents.data.0.id', $match)
            ->where('decedents.data.0.full_name', 'SANTOS, JUAN'));
});

it('filters by statuses death year and unidentified case reference', function () {
    $unidentified = registryFilterDecedent($this->gasan->id, [
        'first_name' => null,
        'last_name' => null,
        'identity_status' => 'unidentified',
        'registration_status' => 'pending_review',
        'has_legal_name' => false,
        'registry_number' => null,
        'date_of_death' => '2025-01-10',
    ]);
    registryFilterUnidentifiedDetail($this->gasan->id, $unidentified, 'CASE-GSN-2025-0001');
    registryFilterDecedent($this->gasan->id, [
        'first_name' => 'BULMA',
        'last_name' => 'BRIEFS',
        'identity_status' => 'identified',
        'registration_status' => 'verified',
        'date_of_death' => '2024-01-10',
    ]);

    $this->get(route('cemetery.admin.decedents.list.page', [
        'municipality' => $this->gasan->slug,
        'search' => 'case-gsn',
        'registration_status' => 'pending_review',
        'identity_status' => 'unidentified',
        'vital_record_type' => 'death',
        'death_year' => 2025,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.search', 'case-gsn')
            ->where('filters.registration_status', 'pending_review')
            ->where('filters.identity_status', 'unidentified')
            ->where('filters.vital_record_type', 'death')
            ->where('filters.death_year', 2025)
            ->has('decedents.data', 1)
            ->where('decedents.data.0.id', $unidentified));
});

it('filters interred and unassigned records and keeps query strings in pagination links', function () {
    $site = registryFilterSite($this->gasan->id);
    $block = registryFilterBlock($this->gasan->id, registryFilterSection($this->gasan->id, $site));
    $interred = registryFilterDecedent($this->gasan->id, [
        'first_name' => 'GOKU',
        'last_name' => 'SON',
        'date_of_death' => '2024-02-01',
    ]);
    $plot = registryFilterPlot($this->gasan->id, $site, $block);
    registryFilterInterment($this->gasan->id, $interred, $plot);

    for ($i = 1; $i <= 11; $i++) {
        registryFilterDecedent($this->gasan->id, [
            'first_name' => 'JUAN',
            'last_name' => 'PAGE '.$i,
            'date_of_death' => '2024-03-01',
        ]);
    }

    $this->get(route('cemetery.admin.decedents.list.page', [
        'municipality' => $this->gasan->slug,
        'interment_status' => 'interred',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.interment_status', 'interred')
            ->has('decedents.data', 1)
            ->where('decedents.data.0.id', $interred));

    $this->get(route('cemetery.admin.decedents.list.page', [
        'municipality' => $this->gasan->slug,
        'search' => 'juan',
        'death_year' => 2024,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.search', 'juan')
            ->where('filters.death_year', 2024)
            ->where('decedents.meta.total', 11)
            ->where('decedents.meta.links.2.label', '2')
            ->where('decedents.meta.links.2.url', fn (?string $url) => str_contains((string) $url, 'search=juan')
                && str_contains((string) $url, 'death_year=2024')));
});

it('shows final cemetery outcomes separately from unassigned records', function () {
    $site = registryFilterSite($this->gasan->id);
    $block = registryFilterBlock($this->gasan->id, registryFilterSection($this->gasan->id, $site));
    $plot = registryFilterPlot($this->gasan->id, $site, $block);

    $transferredOut = registryFilterDecedent($this->gasan->id, [
        'first_name' => 'VEGETA',
        'last_name' => 'PRINCE',
        'date_of_death' => '2024-04-01',
    ]);
    registryFilterInterment($this->gasan->id, $transferredOut, $plot, [
        'ended_at' => now(),
        'ended_by' => null,
        'end_type' => 'transferred_out',
        'end_reason' => 'TRANSFERRED TO BOAC CEMETERY',
        'transfer_destination' => 'BOAC CEMETERY',
    ]);

    $unassigned = registryFilterDecedent($this->gasan->id, [
        'first_name' => 'KRILLIN',
        'last_name' => 'MONK',
        'date_of_death' => '2024-04-02',
    ]);

    $this->get(route('cemetery.admin.decedents.list.page', [
        'municipality' => $this->gasan->slug,
        'search' => 'vegeta',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('decedents.data', 1)
            ->where('decedents.data.0.id', $transferredOut)
            ->where('decedents.data.0.interment_status', 'transferred_out')
            ->where('decedents.data.0.plot_label', 'LOT 1'));

    $this->get(route('cemetery.admin.decedents.list.page', [
        'municipality' => $this->gasan->slug,
        'interment_status' => 'transferred_out',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.interment_status', 'transferred_out')
            ->has('decedents.data', 1)
            ->where('decedents.data.0.id', $transferredOut));

    $this->get(route('cemetery.admin.decedents.list.page', [
        'municipality' => $this->gasan->slug,
        'interment_status' => 'unassigned',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.interment_status', 'unassigned')
            ->has('decedents.data', 1)
            ->where('decedents.data.0.id', $unassigned));
});

function registryFilterMunicipality(string $psgcMunicipalityId, string $name, string $slug, string $code): Municipality
{
    return Municipality::query()->create([
        'id' => (string) Str::ulid(),
        'psgc_municipal_id' => $psgcMunicipalityId,
        'name' => $name,
        'slug' => $slug,
        'municipal_code' => $code,
        'is_active' => true,
        'zip_code' => '4905',
    ]);
}

function registryFilterDecedent(string $municipalId, array $overrides = []): string
{
    DB::table('cemetery_decedents')->insert(array_merge([
        'id' => $id = (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'first_name' => 'JUAN',
        'last_name' => 'SANTOS',
        'date_of_death' => '2024-03-08',
        'date_of_registration' => '2024-03-09',
        'vital_record_type' => 'death',
        'identity_status' => 'identified',
        'registration_status' => 'verified',
        'has_legal_name' => true,
        'registry_number' => 'REG-'.Str::upper(Str::random(6)),
        'death_certificate_no' => 'DC-'.Str::upper(Str::random(6)),
        'created_at' => now(),
        'updated_at' => now(),
    ], $overrides));

    return $id;
}

function registryFilterUnidentifiedDetail(string $municipalId, string $decedentId, string $caseReference): void
{
    DB::table('cemetery_unidentified_details')->insert([
        'id' => (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'decedent_id' => $decedentId,
        'case_reference' => $caseReference,
        'date_found' => '2025-01-10',
        'found_location' => 'GASAN',
        'reporting_agency' => 'PNP',
        'physical_description' => 'UNIDENTIFIED MALE',
        'requires_medico_legal' => true,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
}

function registryFilterSite(string $municipalId): string
{
    DB::table('cemetery_sites')->insert([
        'id' => $id = (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'name' => 'GASAN CENTRAL',
        'status' => 'active',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return $id;
}

function registryFilterSection(string $municipalId, string $siteId): string
{
    DB::table('cemetery_sections')->insert([
        'id' => $id = (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'cemetery_site_id' => $siteId,
        'name' => 'NEW ANNEX',
        'status' => 'active',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return $id;
}

function registryFilterBlock(string $municipalId, string $sectionId): string
{
    DB::table('cemetery_blocks')->insert([
        'id' => $id = (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'section_id' => $sectionId,
        'name' => 'GENERAL',
        'status' => 'active',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return $id;
}

function registryFilterPlot(string $municipalId, string $siteId, string $blockId): string
{
    DB::table('cemetery_plots')->insert([
        'id' => $id = (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'cemetery_site_id' => $siteId,
        'block_id' => $blockId,
        'name' => 'LOT 1',
        'type' => 'lawn_lot',
        'status' => 'occupied',
        'capacity' => 1,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return $id;
}

function registryFilterInterment(string $municipalId, string $decedentId, string $plotId, array $overrides = []): void
{
    DB::table('cemetery_interments')->insert(array_merge([
        'id' => (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'decedent_id' => $decedentId,
        'plot_id' => $plotId,
        'interment_date' => '2024-03-10',
        'type' => 'initial',
        'created_at' => now(),
        'updated_at' => now(),
    ], $overrides));
}
