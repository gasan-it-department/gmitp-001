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
        require database_path('migrations/2026_06_14_000008_create_cemetery_plot_deeds_table.php'),
        require database_path('migrations/2026_06_14_000009_create_cemetery_interments_table.php'),
        require database_path('migrations/2026_06_15_000001_add_cemetery_decedent_registration_fields.php'),
        require database_path('migrations/2026_06_15_000002_create_cemetery_decedent_documents_table.php'),
        require database_path('migrations/2026_06_15_000003_create_cemetery_interment_readiness_overrides_table.php'),
    ];

    foreach ($this->migrations as $migration) {
        $migration->up();
    }

    $this->gasan = intermentMunicipality('1', 'Gasan', 'gasan', 'GAS', '4905');
    $this->boac = intermentMunicipality('2', 'Boac', 'boac', 'BOA', '4900');

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

it('lists active interments only for the selected Site workspace', function () {
    $selectedSite = intermentSite($this->gasan->id, 'GASAN CENTRAL');
    $siblingSite = intermentSite($this->gasan->id, 'TIGUION CEMETERY');
    $selectedBlock = intermentBlock($this->gasan->id, intermentSection($this->gasan->id, $selectedSite, 'NEW ANNEX'), 'GENERAL');
    $siblingBlock = intermentBlock($this->gasan->id, intermentSection($this->gasan->id, $siblingSite, 'OLD AREA'), 'GENERAL');
    $selectedPlot = intermentPlot($this->gasan->id, $selectedSite, $selectedBlock, 'LOT 701', 'occupied');
    $siblingPlot = intermentPlot($this->gasan->id, $siblingSite, $siblingBlock, 'LOT 999', 'occupied');
    $selectedDecedent = intermentReadyDecedent($this->gasan->id, 'SON', 'GOKU');
    $siblingDecedent = intermentReadyDecedent($this->gasan->id, 'SON', 'GOHAN');

    intermentRecord($this->gasan->id, $selectedDecedent, $selectedPlot, '2026-06-20');
    intermentRecord($this->gasan->id, $siblingDecedent, $siblingPlot, '2026-06-21');

    $this->get(route('cemetery.admin.sites.workspace.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $selectedSite,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Cemetery/Admin/Site/Workspace/CemeterySiteWorkspace')
            ->has('interments', 1)
            ->where('interments.0.decedent_id', $selectedDecedent)
            ->where('interments.0.plot_label', 'LOT 701')
            ->where('interments.0.section_name', 'NEW ANNEX')
            ->where('interments.0.block_name', 'GENERAL'));
});

it('loads ready unassigned Decedents and available assignable Site Plots on create page', function () {
    $site = intermentSite($this->gasan->id, 'GASAN CENTRAL');
    $siblingSite = intermentSite($this->gasan->id, 'TIGUION CEMETERY');
    $block = intermentBlock($this->gasan->id, intermentSection($this->gasan->id, $site, 'NEW ANNEX'), 'GENERAL');
    $siblingBlock = intermentBlock($this->gasan->id, intermentSection($this->gasan->id, $siblingSite, 'OLD AREA'), 'GENERAL');
    $ready = intermentReadyDecedent($this->gasan->id, 'BRIEFS', 'BULMA');
    $unready = intermentVerifiedDecedent($this->gasan->id, 'BRIEFS', 'TRUNKS');
    $alreadyInterred = intermentReadyDecedent($this->gasan->id, 'SON', 'GOTEN');
    $availablePlot = intermentPlot($this->gasan->id, $site, $block, 'LOT 701', 'available');
    intermentPlot($this->gasan->id, $site, $block, 'LOT 702', 'occupied');
    intermentPlot($this->gasan->id, $siblingSite, $siblingBlock, 'LOT 999', 'available');
    $usedPlot = intermentPlot($this->gasan->id, $site, $block, 'LOT 703', 'occupied');
    intermentRecord($this->gasan->id, $alreadyInterred, $usedPlot, '2026-06-20');

    $this->get(route('cemetery.admin.sites.interments.create.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $site,
        'decedent_id' => $ready,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Cemetery/Admin/Interments/Create/CreateSiteInterment')
            ->where('site.id', $site)
            ->where('preselected_decedent_id', $ready)
            ->has('decedents', 1)
            ->where('decedents.0.id', $ready)
            ->has('available_plots', 1)
            ->where('available_plots.0.id', $availablePlot));

    expect($unready)->not->toBe($ready);
});

it('stores a Site-scoped interment and flips the Plot to occupied', function () {
    $site = intermentSite($this->gasan->id, 'GASAN CENTRAL');
    $block = intermentBlock($this->gasan->id, intermentSection($this->gasan->id, $site, 'NEW ANNEX'), 'GENERAL');
    $decedent = intermentReadyDecedent($this->gasan->id, 'SANTOS', 'JUAN');
    $plot = intermentPlot($this->gasan->id, $site, $block, 'LOT 737', 'available');

    $this->post(route('interments.store'), [
        'cemetery_site_id' => $site,
        'decedent_id' => $decedent,
        'plot_id' => $plot,
        'interment_date' => '2026-06-20',
        'type' => 'initial',
        'notes' => 'Burial clearance recorded.',
        'leaseholder_name' => 'juan dela cruz',
        'leaseholder_relationship' => 'son',
        'leaseholder_contact' => '09171234567',
        'leaseholder_address' => 'Cabugao, Gasan',
        'amount_paid' => '1096.50',
        'or_number' => 'or-001',
        'lease_notes' => 'Paid at municipal treasury.',
    ])->assertRedirect(route('cemetery.admin.sites.workspace.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $site,
        'tab' => 'interments',
    ]));

    $intermentId = DB::table('cemetery_interments')->where('decedent_id', $decedent)->value('id');
    $lease = DB::table('cemetery_plot_leases')->where('interment_id', $intermentId)->first();

    expect(DB::table('cemetery_interments')->where('decedent_id', $decedent)->count())->toBe(1)
        ->and(DB::table('cemetery_plots')->where('id', $plot)->value('status'))->toBe('occupied')
        ->and($lease)->not->toBeNull()
        ->and($lease->municipal_id)->toBe($this->gasan->id)
        ->and($lease->plot_id)->toBe($plot)
        ->and($lease->leaseholder_name)->toBe('JUAN DELA CRUZ')
        ->and($lease->leaseholder_relationship)->toBe('SON')
        ->and($lease->leaseholder_contact)->toBe('09171234567')
        ->and($lease->leaseholder_address)->toBe('Cabugao, Gasan')
        ->and(substr((string) $lease->lease_start, 0, 10))->toBe('2026-06-20')
        ->and(substr((string) $lease->lease_end, 0, 10))->toBe('2031-06-20')
        ->and((float) $lease->amount_paid)->toBe(1096.50)
        ->and($lease->or_number)->toBe('OR-001')
        ->and($lease->status)->toBe('active')
        ->and($lease->notes)->toBe('Paid at municipal treasury.');
});

it('allows shared plots to receive interments until capacity is reached', function () {
    $site = intermentSite($this->gasan->id, 'GASAN CENTRAL');
    $block = intermentBlock($this->gasan->id, intermentSection($this->gasan->id, $site, 'NEW ANNEX'), 'GENERAL');
    $firstDecedent = intermentReadyDecedent($this->gasan->id, 'SANTOS', 'ANA');
    $secondDecedent = intermentReadyDecedent($this->gasan->id, 'SANTOS', 'BEN');
    $thirdDecedent = intermentReadyDecedent($this->gasan->id, 'SANTOS', 'CARLO');
    $plot = intermentPlot($this->gasan->id, $site, $block, 'LOT 800', 'available', 'shared', 2);

    $this->post(route('interments.store'), intermentPayload($site, $firstDecedent, $plot, [
        'or_number' => 'OR-SHARED-1',
    ]))->assertRedirect();

    $this->post(route('interments.store'), intermentPayload($site, $secondDecedent, $plot, [
        'or_number' => 'OR-SHARED-2',
    ]))->assertRedirect();

    $this->post(route('interments.store'), intermentPayload($site, $thirdDecedent, $plot, [
        'or_number' => 'OR-SHARED-3',
    ]))->assertSessionHasErrors('plot_id');

    expect(DB::table('cemetery_interments')->where('plot_id', $plot)->count())->toBe(2)
        ->and(DB::table('cemetery_plots')->where('id', $plot)->value('status'))->toBe('occupied');
});

it('rejects a second active interment for single plots', function () {
    $site = intermentSite($this->gasan->id, 'GASAN CENTRAL');
    $block = intermentBlock($this->gasan->id, intermentSection($this->gasan->id, $site, 'NEW ANNEX'), 'GENERAL');
    $firstDecedent = intermentReadyDecedent($this->gasan->id, 'REYES', 'ANA');
    $secondDecedent = intermentReadyDecedent($this->gasan->id, 'REYES', 'BEN');
    $plot = intermentPlot($this->gasan->id, $site, $block, 'LOT 801', 'available');

    $this->post(route('interments.store'), intermentPayload($site, $firstDecedent, $plot, [
        'or_number' => 'OR-SINGLE-1',
    ]))->assertRedirect();

    $this->post(route('interments.store'), intermentPayload($site, $secondDecedent, $plot, [
        'or_number' => 'OR-SINGLE-2',
    ]))->assertSessionHasErrors('plot_id');

    expect(DB::table('cemetery_interments')->where('plot_id', $plot)->count())->toBe(1);
});

it('rejects direct interment into slotted apartment parent rows', function () {
    $site = intermentSite($this->gasan->id, 'GASAN CENTRAL');
    $block = intermentBlock($this->gasan->id, intermentSection($this->gasan->id, $site, 'APARTMENT AREA'), 'BUILDING A');
    $decedent = intermentReadyDecedent($this->gasan->id, 'CRUZ', 'MARIA');
    $parentPlot = intermentPlot($this->gasan->id, $site, $block, 'APARTMENT A', null, 'slotted', 10, 'apartment_niche');

    $this->post(route('interments.store'), intermentPayload($site, $decedent, $parentPlot, [
        'or_number' => 'OR-SLOTTED-1',
    ]))->assertSessionHasErrors('plot_id');

    expect(DB::table('cemetery_interments')->where('plot_id', $parentPlot)->count())->toBe(0);
});

it('requires leaseholder and keeps interment atomic when lease validation fails', function () {
    $site = intermentSite($this->gasan->id, 'GASAN CENTRAL');
    $block = intermentBlock($this->gasan->id, intermentSection($this->gasan->id, $site, 'NEW ANNEX'), 'GENERAL');
    $decedent = intermentReadyDecedent($this->gasan->id, 'SANTOS', 'PEDRO');
    $plot = intermentPlot($this->gasan->id, $site, $block, 'LOT 738', 'available');

    $this->post(route('interments.store'), [
        'cemetery_site_id' => $site,
        'decedent_id' => $decedent,
        'plot_id' => $plot,
        'interment_date' => '2026-06-20',
        'type' => 'initial',
        'amount_paid' => '500.00',
    ])->assertSessionHasErrors(['leaseholder_name', 'or_number']);

    expect(DB::table('cemetery_interments')->count())->toBe(0)
        ->and(DB::table('cemetery_plot_leases')->count())->toBe(0)
        ->and(DB::table('cemetery_plots')->where('id', $plot)->value('status'))->toBe('available');
});

it('blocks duplicate OR numbers within one municipality but allows them across municipalities', function () {
    $site = intermentSite($this->gasan->id, 'GASAN CENTRAL');
    $block = intermentBlock($this->gasan->id, intermentSection($this->gasan->id, $site, 'NEW ANNEX'), 'GENERAL');
    $firstDecedent = intermentReadyDecedent($this->gasan->id, 'SANTOS', 'ANA');
    $secondDecedent = intermentReadyDecedent($this->gasan->id, 'SANTOS', 'LUIS');
    $firstPlot = intermentPlot($this->gasan->id, $site, $block, 'LOT 740', 'available');
    $secondPlot = intermentPlot($this->gasan->id, $site, $block, 'LOT 741', 'available');

    $this->post(route('interments.store'), intermentPayload($site, $firstDecedent, $firstPlot, [
        'or_number' => 'OR-777',
    ]))->assertRedirect();

    $this->post(route('interments.store'), intermentPayload($site, $secondDecedent, $secondPlot, [
        'or_number' => 'or-777',
    ]))->assertSessionHasErrors('or_number');

    $boacSite = intermentSite($this->boac->id, 'BOAC CENTRAL');
    $boacBlock = intermentBlock($this->boac->id, intermentSection($this->boac->id, $boacSite, 'MAIN'), 'GENERAL');
    $boacDecedent = intermentReadyDecedent($this->boac->id, 'REYES', 'MARIO');
    $boacPlot = intermentPlot($this->boac->id, $boacSite, $boacBlock, 'LOT 1', 'available');

    app()->instance('municipal_id', $this->boac->id);
    app()->instance('current_municipality', $this->boac);

    $this->post(route('interments.store'), intermentPayload($boacSite, $boacDecedent, $boacPlot, [
        'or_number' => 'OR-777',
    ]))->assertRedirect(route('cemetery.admin.sites.workspace.page', [
        'municipality' => $this->boac->slug,
        'cemetery_site_id' => $boacSite,
        'tab' => 'interments',
    ]));

    expect(DB::table('cemetery_plot_leases')->where('or_number', 'OR-777')->count())->toBe(2)
        ->and(DB::table('cemetery_interments')->where('decedent_id', $secondDecedent)->count())->toBe(0)
        ->and(DB::table('cemetery_plots')->where('id', $secondPlot)->value('status'))->toBe('available');
});

it('rejects a forged sibling Site Plot during Site-scoped interment creation', function () {
    $site = intermentSite($this->gasan->id, 'GASAN CENTRAL');
    $siblingSite = intermentSite($this->gasan->id, 'TIGUION CEMETERY');
    $siblingBlock = intermentBlock($this->gasan->id, intermentSection($this->gasan->id, $siblingSite, 'OLD AREA'), 'GENERAL');
    $decedent = intermentReadyDecedent($this->gasan->id, 'SANTOS', 'MARIA');
    $siblingPlot = intermentPlot($this->gasan->id, $siblingSite, $siblingBlock, 'LOT 999', 'available');

    $this->post(route('interments.store'), [
        'cemetery_site_id' => $site,
        'decedent_id' => $decedent,
        'plot_id' => $siblingPlot,
        'interment_date' => '2026-06-20',
        'type' => 'initial',
        'notes' => null,
        'leaseholder_name' => 'Maria Santos',
    ])->assertSessionHasErrors('plot_id');

    expect(DB::table('cemetery_interments')->count())->toBe(0)
        ->and(DB::table('cemetery_plots')->where('id', $siblingPlot)->value('status'))->toBe('available');
});

function intermentMunicipality(string $psgcMunicipalityId, string $name, string $slug, string $code, string $zipCode): Municipality
{
    return Municipality::query()->create([
        'id' => (string) Str::ulid(),
        'psgc_municipal_id' => $psgcMunicipalityId,
        'name' => $name,
        'slug' => $slug,
        'municipal_code' => $code,
        'is_active' => true,
        'zip_code' => $zipCode,
    ]);
}

function intermentSite(string $municipalId, string $name, string $status = 'active'): string
{
    DB::table('cemetery_sites')->insert([
        'id' => $id = (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'name' => $name,
        'status' => $status,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return $id;
}

function intermentSection(string $municipalId, string $siteId, string $name): string
{
    DB::table('cemetery_sections')->insert([
        'id' => $id = (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'cemetery_site_id' => $siteId,
        'name' => $name,
        'status' => 'active',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return $id;
}

function intermentBlock(string $municipalId, string $sectionId, string $name): string
{
    DB::table('cemetery_blocks')->insert([
        'id' => $id = (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'section_id' => $sectionId,
        'name' => $name,
        'status' => 'active',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return $id;
}

function intermentPlot(
    string $municipalId,
    string $siteId,
    string $blockId,
    string $name,
    ?string $status,
    string $occupancyMode = 'single',
    int $capacity = 1,
    string $type = 'lawn_lot',
): string {
    DB::table('cemetery_plots')->insert([
        'id' => $id = (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'cemetery_site_id' => $siteId,
        'block_id' => $blockId,
        'name' => $name,
        'type' => $type,
        'status' => $status,
        'occupancy_mode' => $occupancyMode,
        'capacity' => $capacity,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return $id;
}

function intermentVerifiedDecedent(string $municipalId, string $lastName, string $firstName): string
{
    DB::table('cemetery_decedents')->insert([
        'id' => $id = (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'first_name' => $firstName,
        'last_name' => $lastName,
        'date_of_death' => '2026-06-01',
        'date_of_registration' => '2026-06-02',
        'vital_record_type' => 'death',
        'identity_status' => 'identified',
        'registration_status' => 'verified',
        'has_legal_name' => true,
        'registry_number' => 'REG-'.Str::upper(Str::random(6)),
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return $id;
}

function intermentReadyDecedent(string $municipalId, string $lastName, string $firstName): string
{
    $id = intermentVerifiedDecedent($municipalId, $lastName, $firstName);

    foreach (['death_certificate', 'burial_permit'] as $type) {
        DB::table('cemetery_decedent_documents')->insert([
            'id' => (string) Str::ulid(),
            'municipal_id' => $municipalId,
            'decedent_id' => $id,
            'type' => $type,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    return $id;
}

function intermentRecord(string $municipalId, string $decedentId, string $plotId, string $date): string
{
    DB::table('cemetery_interments')->insert([
        'id' => $id = (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'decedent_id' => $decedentId,
        'plot_id' => $plotId,
        'interment_date' => $date,
        'type' => 'initial',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return $id;
}

function intermentPayload(string $siteId, string $decedentId, string $plotId, array $overrides = []): array
{
    return array_merge([
        'cemetery_site_id' => $siteId,
        'decedent_id' => $decedentId,
        'plot_id' => $plotId,
        'interment_date' => '2026-06-20',
        'type' => 'initial',
        'leaseholder_name' => 'Juan Dela Cruz',
        'amount_paid' => '500.00',
        'or_number' => 'OR-001',
    ], $overrides);
}
