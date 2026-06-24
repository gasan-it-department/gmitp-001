<?php

use App\Core\Cemetery\Models\Plot;
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
    Schema::create('psgc_barangays', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('municipality_id');
        $table->string('psgc_code', 20)->unique();
        $table->string('name');
    });

    $this->migrations = [
        require database_path('migrations/2026_06_14_000002_create_cemetery_sites_table.php'),
        require database_path('migrations/2026_06_14_000003_create_cemetery_sections_table.php'),
        require database_path('migrations/2026_06_14_000004_create_cemetery_blocks_table.php'),
        require database_path('migrations/2026_06_14_000005_create_cemetery_plots_table.php'),
    ];
    foreach ($this->migrations as $migration) {
        $migration->up();
    }

    DB::table('psgc_barangays')->insert([
        ['id' => 1, 'municipality_id' => 1, 'psgc_code' => '174003001', 'name' => 'ANTIPOLO'],
        ['id' => 2, 'municipality_id' => 2, 'psgc_code' => '174001001', 'name' => 'AGOT'],
    ]);

    $this->gasan = workspaceMunicipality('1', 'Gasan', 'gasan', 'GAS', '4905');
    $this->boac = workspaceMunicipality('2', 'Boac', 'boac', 'BOA', '4900');

    workspaceContext($this->gasan);
    activity()->disableLogging();
    $this->withoutMiddleware();
});

afterEach(function () {
    activity()->enableLogging();

    foreach (array_reverse($this->migrations) as $migration) {
        $migration->down();
    }

    Schema::dropIfExists('psgc_barangays');
    Schema::dropIfExists('municipalities');
});

it('lists only the current municipality Sites including read-only statuses', function () {
    $active = workspaceSite($this->gasan->id, 'GASAN CENTRAL', 'active', '174003001');
    $inactive = workspaceSite($this->gasan->id, 'TIGUION CEMETERY', 'inactive');
    $deleted = workspaceSite($this->gasan->id, 'OLD SITE', 'closed');
    workspaceSite($this->boac->id, 'BOAC CENTRAL', 'active', '174001001');
    DB::table('cemetery_sites')->where('id', $deleted)->update(['deleted_at' => now()]);

    $section = workspaceSection($this->gasan->id, $active, 'SECTION A');

    $this->get(route('cemetery.admin.sites.list.page', [
        'municipality' => $this->gasan->slug,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Cemetery/Admin/Site/List/ListCemeterySites')
            ->has('sites', 2)
            ->where('sites.0.id', $active)
            ->where('sites.0.barangay_name', 'ANTIPOLO')
            ->where('sites.0.sections_count', 1)
            ->where('sites.1.id', $inactive));

    expect($section)->not->toBeEmpty();
});

it('opens a tenant-scoped Site workspace with only that Site Plot inventory', function () {
    $selectedSite = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $siblingSite = workspaceSite($this->gasan->id, 'TIGUION CEMETERY');
    $selectedBlock = workspaceBlock(
        $this->gasan->id,
        workspaceSection($this->gasan->id, $selectedSite, 'SECTION A'),
        'BLOCK 1'
    );
    $siblingBlock = workspaceBlock(
        $this->gasan->id,
        workspaceSection($this->gasan->id, $siblingSite, 'SECTION B'),
        'BLOCK 2'
    );
    $selectedPlot = workspacePlot($this->gasan->id, $selectedSite, $selectedBlock, 'A-1', 'available');
    workspacePlot($this->gasan->id, $siblingSite, $siblingBlock, 'B-1', 'occupied');

    $this->get(route('cemetery.admin.sites.workspace.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $selectedSite,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Cemetery/Admin/Site/Workspace/CemeterySiteWorkspace')
            ->where('site.id', $selectedSite)
            ->has('plots.data', 1)
            ->where('plots.data.0.id', $selectedPlot)
            ->where('inventory_counts.total', 1)
            ->where('inventory_counts.available', 1)
            ->where('inventory_counts.occupied', 0));
});

it('fails closed when opening another municipality Site', function () {
    $boacSite = workspaceSite($this->boac->id, 'BOAC CENTRAL');

    $this->get(route('cemetery.admin.sites.workspace.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $boacSite,
    ]))->assertNotFound();
});

it('shows only active Blocks from the selected Site on Plot creation', function () {
    $selectedSite = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $siblingSite = workspaceSite($this->gasan->id, 'TIGUION CEMETERY');
    $selectedBlock = workspaceBlock(
        $this->gasan->id,
        workspaceSection($this->gasan->id, $selectedSite, 'SECTION A'),
        'BLOCK 1'
    );
    workspaceBlock(
        $this->gasan->id,
        workspaceSection($this->gasan->id, $siblingSite, 'SECTION B'),
        'BLOCK 2'
    );

    $this->get(route('cemetery.admin.sites.plots.create.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $selectedSite,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Cemetery/Admin/Plots/Create/CreatePlot')
            ->where('site.id', $selectedSite)
            ->has('blocks', 1)
            ->where('blocks.0.id', $selectedBlock));
});

it('rejects Plot creation for sibling Blocks and inactive Sites', function () {
    $activeSite = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $inactiveSite = workspaceSite($this->gasan->id, 'OLD CEMETERY', 'inactive');
    $activeBlock = workspaceBlock(
        $this->gasan->id,
        workspaceSection($this->gasan->id, $activeSite, 'SECTION A'),
        'BLOCK 1'
    );
    $inactiveBlock = workspaceBlock(
        $this->gasan->id,
        workspaceSection($this->gasan->id, $inactiveSite, 'SECTION OLD'),
        'BLOCK OLD'
    );

    $this->post(route('cemetery-sites.plots.store', [
        'cemetery_site_id' => $activeSite,
    ]), workspacePlotPayload($inactiveBlock))
        ->assertSessionHasErrors('block_id');

    session()->flush();

    $this->get(route('cemetery.admin.sites.plots.create.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $inactiveSite,
    ]))->assertNotFound();

    $this->post(route('cemetery-sites.plots.store', [
        'cemetery_site_id' => $inactiveSite,
    ]), workspacePlotPayload($inactiveBlock))
        ->assertNotFound();
});

it('creates a Plot inside the selected active Site and returns to its workspace', function () {
    $site = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $block = workspaceBlock(
        $this->gasan->id,
        workspaceSection($this->gasan->id, $site, 'SECTION A'),
        'BLOCK 1'
    );

    $response = $this->post(route('cemetery-sites.plots.store', [
        'cemetery_site_id' => $site,
    ]), workspacePlotPayload($block));

    $plot = Plot::query()->sole();

    $response->assertRedirect(route('cemetery.admin.sites.workspace.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $site,
    ]));

    expect($plot->cemetery_site_id)->toBe($site)
        ->and($plot->block_id)->toBe($block);
});

function workspaceMunicipality(
    string $psgcMunicipalityId,
    string $name,
    string $slug,
    string $code,
    string $zipCode,
): Municipality {
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

function workspaceContext(Municipality $municipality): void
{
    app()->instance('municipal_id', $municipality->id);
    app()->instance('current_municipality', $municipality);
}

function workspaceSite(
    string $municipalId,
    string $name,
    string $status = 'active',
    ?string $barangayCode = null,
): string {
    DB::table('cemetery_sites')->insert([
        'id' => $id = (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'name' => $name,
        'psgc_barangay_code' => $barangayCode,
        'status' => $status,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return $id;
}

function workspaceSection(string $municipalId, string $siteId, string $name): string
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

function workspaceBlock(string $municipalId, string $sectionId, string $name): string
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

function workspacePlot(
    string $municipalId,
    string $siteId,
    string $blockId,
    string $name,
    string $status,
): string {
    DB::table('cemetery_plots')->insert([
        'id' => $id = (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'cemetery_site_id' => $siteId,
        'block_id' => $blockId,
        'name' => $name,
        'type' => 'lawn_lot',
        'status' => $status,
        'capacity' => 1,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return $id;
}

function workspacePlotPayload(string $blockId): array
{
    return [
        'block_id' => $blockId,
        'name' => 'PLOT A-1',
        'type' => 'lawn_lot',
        'capacity' => 1,
        'row' => 'A',
        'position' => null,
    ];
}
