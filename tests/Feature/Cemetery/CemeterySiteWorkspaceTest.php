<?php

use App\Core\Cemetery\Models\Plot;
use App\Core\Municipality\Models\Municipality;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Artisan;
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
    Schema::create('cemetery_decedents', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->softDeletes();
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

    $this->migrations = [
        require database_path('migrations/2026_06_14_000002_create_cemetery_sites_table.php'),
        require database_path('migrations/2026_06_14_000003_create_cemetery_sections_table.php'),
        require database_path('migrations/2026_06_14_000004_create_cemetery_blocks_table.php'),
        require database_path('migrations/2026_06_14_000005_create_cemetery_plots_table.php'),
        require database_path('migrations/2026_06_14_000007_create_cemetery_unidentified_details_table.php'),
        require database_path('migrations/2026_06_14_000008_create_cemetery_plot_deeds_table.php'),
        require database_path('migrations/2026_06_14_000009_create_cemetery_interments_table.php'),
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
    Schema::dropIfExists('activity_log');
    Schema::dropIfExists('cemetery_decedents');
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
            ->has('layout', 1)
            ->where('layout.0.id', DB::table('cemetery_blocks')->where('id', $selectedBlock)->value('section_id'))
            ->has('layout.0.blocks', 1)
            ->where('layout.0.blocks.0.id', $selectedBlock)
            ->where('layout.0.blocks.0.counts.available', 1)
            ->has('plots.data', 1)
            ->where('plots.data.0.id', $selectedPlot)
            ->where('inventory_counts.total', 1)
            ->where('inventory_counts.available', 1)
            ->where('inventory_counts.occupied', 0));
});

it('updates Cemetery Site details without changing operational status', function () {
    activity()->enableLogging();

    $site = workspaceSite($this->gasan->id, 'GASAN CENTRAL', 'active', '174003001');
    $duplicate = workspaceSite($this->gasan->id, 'TIGUION CEMETERY');
    $boacSite = workspaceSite($this->boac->id, 'BOAC CENTRAL', 'active', '174001001');

    $this->patch(route('cemetery-sites.update', [
        'cemetery_site_id' => $site,
    ]), [
        'name' => 'gasan municipal cemetery',
        'psgc_barangay_code' => '174003001',
        'street_name' => 'purok 2',
        'notes' => 'Updated after site walkthrough.',
    ])->assertRedirect(route('cemetery.admin.sites.workspace.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $site,
    ]));

    $updated = DB::table('cemetery_sites')->where('id', $site)->first();

    expect($updated->name)->toBe('GASAN MUNICIPAL CEMETERY')
        ->and($updated->psgc_barangay_code)->toBe('174003001')
        ->and($updated->street_name)->toBe('PUROK 2')
        ->and($updated->notes)->toBe('Updated after site walkthrough.')
        ->and($updated->status)->toBe('active')
        ->and(DB::table('activity_log')->where('event', 'updated')->where('subject_id', $site)->exists())->toBeTrue();

    $this->patch(route('cemetery-sites.update', [
        'cemetery_site_id' => $site,
    ]), [
        'name' => 'TIGUION CEMETERY',
    ])->assertSessionHasErrors('name');

    session()->flush();

    $this->patch(route('cemetery-sites.update', [
        'cemetery_site_id' => $site,
    ]), [
        'name' => 'VALID NAME',
        'psgc_barangay_code' => '174001001',
    ])->assertSessionHasErrors('psgc_barangay_code');

    session()->flush();

    $this->patch(route('cemetery-sites.update', [
        'cemetery_site_id' => $site,
    ]), [
        'name' => 'VALID NAME',
        'status' => 'closed',
    ])->assertSessionHasErrors('status');

    $this->patch(route('cemetery-sites.update', [
        'cemetery_site_id' => $boacSite,
    ]), [
        'name' => 'FORGED TENANT',
    ])->assertNotFound();

    expect(DB::table('cemetery_sites')->where('id', $duplicate)->value('name'))->toBe('TIGUION CEMETERY')
        ->and(DB::table('cemetery_sites')->where('id', $boacSite)->value('name'))->toBe('BOAC CENTRAL');
});

it('filters Site Plot inventory by assignable apartment slots and search', function () {
    $site = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $block = workspaceBlock(
        $this->gasan->id,
        workspaceSection($this->gasan->id, $site, 'APARTMENT AREA'),
        'BUILDING A'
    );

    DB::table('cemetery_plots')->insert([
        [
            'id' => $parent = (string) Str::ulid(),
            'municipal_id' => $this->gasan->id,
            'cemetery_site_id' => $site,
            'block_id' => $block,
            'parent_plot_id' => null,
            'name' => 'APARTMENT A',
            'type' => 'apartment_niche',
            'status' => null,
            'occupancy_mode' => 'slotted',
            'row' => null,
            'level' => null,
            'position' => null,
            'capacity' => 2,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'id' => $availableSlot = (string) Str::ulid(),
            'municipal_id' => $this->gasan->id,
            'cemetery_site_id' => $site,
            'block_id' => $block,
            'parent_plot_id' => $parent,
            'name' => 'APARTMENT A',
            'type' => 'apartment_niche',
            'status' => 'available',
            'occupancy_mode' => 'shared',
            'row' => 'R1',
            'level' => 1,
            'position' => 'N01',
            'capacity' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'id' => $occupiedSlot = (string) Str::ulid(),
            'municipal_id' => $this->gasan->id,
            'cemetery_site_id' => $site,
            'block_id' => $block,
            'parent_plot_id' => $parent,
            'name' => 'APARTMENT A',
            'type' => 'apartment_niche',
            'status' => 'occupied',
            'occupancy_mode' => 'shared',
            'row' => 'R2',
            'level' => 2,
            'position' => 'N03',
            'capacity' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ],
    ]);

    workspaceInterment($this->gasan->id, workspaceDecedent(), $occupiedSlot, '2026-06-20');

    $this->get(route('cemetery.admin.sites.workspace.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $site,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('plots.data', 1)
            ->where('plots.data.0.name', 'APARTMENT A')
            ->where('plots.data.0.status', null)
            ->where('plots.data.0.occupancy_label', '1 / 2'));

    $this->get(route('cemetery.admin.sites.workspace.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $site,
        'scope' => 'assignable',
        'type' => 'apartment_niche',
        'search' => 'n03',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.scope', 'assignable')
            ->where('filters.type', 'apartment_niche')
            ->where('filters.search', 'n03')
            ->has('plots.data', 1)
            ->where('plots.data.0.slot_label', 'APARTMENT A-F2-R2-N03')
            ->where('plots.data.0.status', 'occupied'));

    expect($availableSlot)->not->toBe($occupiedSlot);
});

it('filters Site Plot inventory by Section Block status and row', function () {
    $site = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $sectionA = workspaceSection($this->gasan->id, $site, 'SECTION A');
    $sectionB = workspaceSection($this->gasan->id, $site, 'SECTION B');
    $blockA = workspaceBlock($this->gasan->id, $sectionA, 'BLOCK 1');
    $blockB = workspaceBlock($this->gasan->id, $sectionB, 'BLOCK 2');

    workspacePlot($this->gasan->id, $site, $blockA, 'LOT 701', 'available', 'lawn_lot', 'R1');
    workspacePlot($this->gasan->id, $site, $blockB, 'LOT 702', 'occupied', 'lawn_lot', 'R2');

    $this->get(route('cemetery.admin.sites.workspace.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $site,
        'section_id' => $sectionB,
        'block_id' => $blockB,
        'status' => 'occupied',
        'row' => 'r2',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.section_id', $sectionB)
            ->where('filters.block_id', $blockB)
            ->where('filters.status', 'occupied')
            ->has('plots.data', 1)
            ->where('plots.data.0.name', 'LOT 702'));
});

it('rejects reserved as a Plot inventory status filter', function () {
    $site = workspaceSite($this->gasan->id, 'GASAN CENTRAL');

    $this->get(route('cemetery.admin.sites.workspace.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $site,
        'status' => 'reserved',
    ]))->assertSessionHasErrors('status');
});

it('fails closed when opening another municipality Site', function () {
    $boacSite = workspaceSite($this->boac->id, 'BOAC CENTRAL');

    $this->get(route('cemetery.admin.sites.workspace.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $boacSite,
    ]))->assertNotFound();
});

it('opens a tenant and Site scoped Plot profile with current interments and active plot lease', function () {
    $site = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $block = workspaceBlock(
        $this->gasan->id,
        workspaceSection($this->gasan->id, $site, 'SECTION A'),
        'GENERAL'
    );
    $plot = workspacePlot($this->gasan->id, $site, $block, 'LOT 777', 'occupied');
    DB::table('cemetery_plots')->where('id', $plot)->update([
        'occupancy_mode' => 'shared',
        'capacity' => 3,
        'area_sqm' => '6.50',
    ]);

    $firstDecedent = workspaceDecedent();
    $secondDecedent = workspaceDecedent();
    $firstInterment = workspaceInterment($this->gasan->id, $firstDecedent, $plot, '2026-06-20');
    workspaceInterment($this->gasan->id, $secondDecedent, $plot, '2026-06-21');
    workspaceLease($this->gasan->id, $firstInterment, $plot, 'GRACE SANTOS');

    $this->get(route('cemetery.admin.sites.plots.profile.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $site,
        'plot_id' => $plot,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Cemetery/Admin/Plots/Profile/PlotProfile')
            ->where('site.id', $site)
            ->where('plot.id', $plot)
            ->where('plot.slot_label', 'LOT 777')
            ->where('plot.occupancy_mode', 'shared')
            ->where('plot.area_sqm', '6.50')
            ->where('plot.active_interments_count', 2)
            ->where('plot.occupancy_label', '2 / 3')
            ->where('plot.active_lease.leaseholder_name', 'GRACE SANTOS')
            ->has('plot.current_interments', 2)
            ->missing('plot.current_interments.0.lease'));
});

it('updates the active Plot lease from the Plot profile route', function () {
    activity()->enableLogging();

    $site = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $block = workspaceBlock($this->gasan->id, workspaceSection($this->gasan->id, $site, 'SECTION A'), 'GENERAL');
    $plot = workspacePlot($this->gasan->id, $site, $block, 'LOT 778', 'occupied');
    $interment = workspaceInterment($this->gasan->id, workspaceDecedent(), $plot, '2026-06-20');
    $lease = workspaceLease($this->gasan->id, $interment, $plot, 'OLD HOLDER');

    $this->patch(route('cemetery-sites.plots.lease.update', [
        'cemetery_site_id' => $site,
        'plot_id' => $plot,
    ]), [
        'leaseholder_name' => 'new holder',
        'leaseholder_contact' => '09170000000',
        'leaseholder_address' => 'Cabugao, Gasan',
        'leaseholder_relationship' => 'child',
        'lease_start' => '2026-06-20',
        'lease_end' => '2031-06-20',
        'amount_paid' => '1096.50',
        'or_number' => 'OR-LEASE-1',
        'notes' => 'Corrected responsible person.',
    ])->assertRedirect(route('cemetery.admin.sites.plots.profile.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $site,
        'plot_id' => $plot,
    ]));

    $updated = DB::table('cemetery_plot_leases')->where('id', $lease)->first();

    expect($updated->leaseholder_name)->toBe('NEW HOLDER')
        ->and($updated->leaseholder_relationship)->toBe('CHILD')
        ->and($updated->leaseholder_contact)->toBe('09170000000')
        ->and($updated->leaseholder_address)->toBe('Cabugao, Gasan')
        ->and((float) $updated->amount_paid)->toBe(1096.50)
        ->and($updated->or_number)->toBe('OR-LEASE-1')
        ->and(DB::table('activity_log')->where('subject_id', $lease)->where('log_name', 'cemetery_plot_lease')->exists())->toBeTrue();
});

it('creates the first active Plot lease from the Plot profile route', function () {
    activity()->enableLogging();

    $site = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $block = workspaceBlock($this->gasan->id, workspaceSection($this->gasan->id, $site, 'SECTION A'), 'GENERAL');
    $plot = workspacePlot($this->gasan->id, $site, $block, 'LOT 779', 'occupied');
    workspaceInterment($this->gasan->id, workspaceDecedent(), $plot, '2026-06-20');

    $this->post(route('cemetery-sites.plots.lease.store', [
        'cemetery_site_id' => $site,
        'plot_id' => $plot,
    ]), [
        'leaseholder_name' => 'grace santos',
        'leaseholder_contact' => '09170000000',
        'leaseholder_address' => 'Cabugao, Gasan',
        'leaseholder_relationship' => 'child',
        'lease_start' => '2026-06-20',
        'lease_end' => '2031-06-20',
        'amount_paid' => '1096.50',
        'or_number' => 'OR-NEW-1',
        'notes' => 'Recorded after interment.',
    ])->assertRedirect(route('cemetery.admin.sites.plots.profile.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $site,
        'plot_id' => $plot,
    ]));

    $lease = DB::table('cemetery_plot_leases')->where('plot_id', $plot)->first();

    expect($lease)->not->toBeNull()
        ->and($lease->created_from_interment_id)->toBeNull()
        ->and($lease->leaseholder_name)->toBe('GRACE SANTOS')
        ->and($lease->status)->toBe('active')
        ->and($lease->or_number)->toBe('OR-NEW-1')
        ->and(DB::table('activity_log')->where('subject_id', $lease->id)->where('log_name', 'cemetery_plot_lease')->exists())->toBeTrue();

    $this->post(route('cemetery-sites.plots.lease.store', [
        'cemetery_site_id' => $site,
        'plot_id' => $plot,
    ]), [
        'leaseholder_name' => 'another holder',
    ])->assertSessionHasErrors('leaseholder_name');
});

it('blocks duplicate lease OR numbers within one municipality but allows them across municipalities', function () {
    $site = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $block = workspaceBlock($this->gasan->id, workspaceSection($this->gasan->id, $site, 'SECTION A'), 'GENERAL');
    $firstPlot = workspacePlot($this->gasan->id, $site, $block, 'LOT 780', 'occupied');
    $secondPlot = workspacePlot($this->gasan->id, $site, $block, 'LOT 781', 'occupied');

    $this->post(route('cemetery-sites.plots.lease.store', [
        'cemetery_site_id' => $site,
        'plot_id' => $firstPlot,
    ]), [
        'leaseholder_name' => 'First Holder',
        'amount_paid' => '500.00',
        'or_number' => 'OR-777',
    ])->assertRedirect();

    $this->post(route('cemetery-sites.plots.lease.store', [
        'cemetery_site_id' => $site,
        'plot_id' => $secondPlot,
    ]), [
        'leaseholder_name' => 'Second Holder',
        'amount_paid' => '500.00',
        'or_number' => 'or-777',
    ])->assertSessionHasErrors('or_number');

    $boacSite = workspaceSite($this->boac->id, 'BOAC CENTRAL');
    $boacBlock = workspaceBlock($this->boac->id, workspaceSection($this->boac->id, $boacSite, 'SECTION A'), 'GENERAL');
    $boacPlot = workspacePlot($this->boac->id, $boacSite, $boacBlock, 'LOT 1', 'occupied');

    workspaceContext($this->boac);

    $this->post(route('cemetery-sites.plots.lease.store', [
        'cemetery_site_id' => $boacSite,
        'plot_id' => $boacPlot,
    ]), [
        'leaseholder_name' => 'Boac Holder',
        'amount_paid' => '500.00',
        'or_number' => 'OR-777',
    ])->assertRedirect();

    expect(DB::table('cemetery_plot_leases')->where('or_number', 'OR-777')->count())->toBe(2)
        ->and(DB::table('cemetery_plot_leases')->where('plot_id', $secondPlot)->count())->toBe(0);
});

it('fails closed when Plot lease create and update target another tenant or sibling Site', function () {
    $site = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $siblingSite = workspaceSite($this->gasan->id, 'TIGUION CEMETERY');
    $siblingBlock = workspaceBlock($this->gasan->id, workspaceSection($this->gasan->id, $siblingSite, 'SECTION B'), 'GENERAL');
    $siblingPlot = workspacePlot($this->gasan->id, $siblingSite, $siblingBlock, 'LOT 900', 'occupied');
    $siblingInterment = workspaceInterment($this->gasan->id, workspaceDecedent(), $siblingPlot, '2026-06-20');
    $siblingLease = workspaceLease($this->gasan->id, $siblingInterment, $siblingPlot, 'SIBLING HOLDER');

    $boacSite = workspaceSite($this->boac->id, 'BOAC CENTRAL');
    $boacBlock = workspaceBlock($this->boac->id, workspaceSection($this->boac->id, $boacSite, 'SECTION A'), 'GENERAL');
    $boacPlot = workspacePlot($this->boac->id, $boacSite, $boacBlock, 'LOT 1', 'occupied');

    $this->post(route('cemetery-sites.plots.lease.store', [
        'cemetery_site_id' => $site,
        'plot_id' => $siblingPlot,
    ]), [
        'leaseholder_name' => 'Forged Sibling Holder',
    ])->assertNotFound();

    $this->post(route('cemetery-sites.plots.lease.store', [
        'cemetery_site_id' => $boacSite,
        'plot_id' => $boacPlot,
    ]), [
        'leaseholder_name' => 'Forged Boac Holder',
    ])->assertNotFound();

    $this->patch(route('cemetery-sites.plots.lease.update', [
        'cemetery_site_id' => $site,
        'plot_id' => $siblingPlot,
    ]), [
        'leaseholder_name' => 'Changed Holder',
    ])->assertNotFound();

    expect(DB::table('cemetery_plot_leases')->where('plot_id', $boacPlot)->count())->toBe(0)
        ->and(DB::table('cemetery_plot_leases')->where('id', $siblingLease)->value('leaseholder_name'))->toBe('SIBLING HOLDER')
        ->and(DB::table('cemetery_plot_leases')->where('leaseholder_name', 'FORGED SIBLING HOLDER')->exists())->toBeFalse();
});

it('shows child niches for slotted apartment parent Plot profiles', function () {
    $site = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $block = workspaceBlock(
        $this->gasan->id,
        workspaceSection($this->gasan->id, $site, 'APARTMENT AREA'),
        'BUILDING A'
    );
    $parent = workspaceApartmentPlot($this->gasan->id, $site, $block, 'APARTMENT A', null, null, null, null, 'slotted', null, 2);
    $slot = workspaceApartmentPlot($this->gasan->id, $site, $block, 'APARTMENT A', $parent, 1, 'R1', 'N01', 'shared', 'available', 2);

    workspaceInterment($this->gasan->id, workspaceDecedent(), $slot, '2026-06-20');

    $this->get(route('cemetery.admin.sites.plots.profile.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $site,
        'plot_id' => $parent,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('plot.id', $parent)
            ->where('plot.occupancy_mode', 'slotted')
            ->where('plot.occupancy_label', '1 / 2')
            ->has('plot.child_niches', 1)
            ->where('plot.child_niches.0.id', $slot)
            ->where('plot.child_niches.0.slot_label', 'APARTMENT A-F1-R1-N01')
            ->where('plot.child_niches.0.occupancy_label', '1 / 2'));
});

it('fails closed when opening a sibling Site Plot through the selected Site route', function () {
    $selectedSite = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $siblingSite = workspaceSite($this->gasan->id, 'TIGUION CEMETERY');
    $siblingPlot = workspacePlot(
        $this->gasan->id,
        $siblingSite,
        workspaceBlock($this->gasan->id, workspaceSection($this->gasan->id, $siblingSite, 'SECTION B'), 'GENERAL'),
        'LOT 999',
        'available'
    );

    $this->get(route('cemetery.admin.sites.plots.profile.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $selectedSite,
        'plot_id' => $siblingPlot,
    ]))->assertNotFound();
});

it('updates standard Plot details and blocks duplicate names in the same Block', function () {
    $site = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $block = workspaceBlock($this->gasan->id, workspaceSection($this->gasan->id, $site, 'SECTION A'), 'GENERAL');
    $plot = workspacePlot($this->gasan->id, $site, $block, 'LOT 701', 'available');
    workspacePlot($this->gasan->id, $site, $block, 'LOT 702', 'available');

    $this->patch(route('cemetery-sites.plots.details.update', [
        'cemetery_site_id' => $site,
        'plot_id' => $plot,
    ]), [
        'name' => 'lot 703',
        'type' => 'bone_ossuary',
        'area_sqm' => '8.25',
    ])->assertRedirect(route('cemetery.admin.sites.plots.profile.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $site,
        'plot_id' => $plot,
    ]));

    expect(DB::table('cemetery_plots')->where('id', $plot)->value('name'))->toBe('LOT 703')
        ->and(DB::table('cemetery_plots')->where('id', $plot)->value('type'))->toBe('bone_ossuary')
        ->and((float) DB::table('cemetery_plots')->where('id', $plot)->value('area_sqm'))->toBe(8.25);

    $this->patch(route('cemetery-sites.plots.details.update', [
        'cemetery_site_id' => $site,
        'plot_id' => $plot,
    ]), [
        'name' => 'LOT 702',
        'type' => 'lawn_lot',
    ])->assertSessionHasErrors('name');
});

it('blocks manual apartment niche label edits in V1', function () {
    $site = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $block = workspaceBlock($this->gasan->id, workspaceSection($this->gasan->id, $site, 'APARTMENT AREA'), 'BUILDING A');
    $parent = workspaceApartmentPlot($this->gasan->id, $site, $block, 'APARTMENT A', null, null, null, null, 'slotted', null, 1);

    $this->patch(route('cemetery-sites.plots.details.update', [
        'cemetery_site_id' => $site,
        'plot_id' => $parent,
    ]), [
        'name' => 'APARTMENT B',
        'type' => 'lawn_lot',
    ])->assertSessionHasErrors('name');
});

it('changes Plot occupancy with guards and activity history', function () {
    activity()->enableLogging();

    $site = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $block = workspaceBlock($this->gasan->id, workspaceSection($this->gasan->id, $site, 'SECTION A'), 'GENERAL');
    $plot = workspacePlot($this->gasan->id, $site, $block, 'LOT 750', 'available');

    $this->patch(route('cemetery-sites.plots.occupancy.update', [
        'cemetery_site_id' => $site,
        'plot_id' => $plot,
    ]), [
        'occupancy_mode' => 'shared',
        'capacity' => 3,
        'reason' => 'Family lot confirmed by caretaker.',
    ])->assertRedirect();

    expect(DB::table('cemetery_plots')->where('id', $plot)->value('occupancy_mode'))->toBe('shared')
        ->and(DB::table('cemetery_plots')->where('id', $plot)->value('capacity'))->toBe(3)
        ->and(DB::table('activity_log')->where('event', 'occupancy_changed')->exists())->toBeTrue();

    workspaceInterment($this->gasan->id, workspaceDecedent(), $plot, '2026-06-20');
    workspaceInterment($this->gasan->id, workspaceDecedent(), $plot, '2026-06-21');

    $this->patch(route('cemetery-sites.plots.occupancy.update', [
        'cemetery_site_id' => $site,
        'plot_id' => $plot,
    ]), [
        'occupancy_mode' => 'single',
        'capacity' => 1,
        'reason' => 'Attempt to make single.',
    ])->assertSessionHasErrors('occupancy_mode');

    $this->patch(route('cemetery-sites.plots.occupancy.update', [
        'cemetery_site_id' => $site,
        'plot_id' => $plot,
    ]), [
        'occupancy_mode' => 'shared',
        'capacity' => 1,
        'reason' => 'Attempt to lower capacity below occupants.',
    ])->assertSessionHasErrors('capacity');
});

it('changes status only for empty assignable Plots and logs the reason', function () {
    activity()->enableLogging();

    $site = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $block = workspaceBlock($this->gasan->id, workspaceSection($this->gasan->id, $site, 'SECTION A'), 'GENERAL');
    $plot = workspacePlot($this->gasan->id, $site, $block, 'LOT 760', 'available');

    $this->patch(route('cemetery-sites.plots.status.update', [
        'cemetery_site_id' => $site,
        'plot_id' => $plot,
    ]), [
        'status' => 'maintenance',
        'reason' => 'Needs physical inspection.',
    ])->assertRedirect();

    expect(DB::table('cemetery_plots')->where('id', $plot)->value('status'))->toBe('maintenance')
        ->and(DB::table('activity_log')->where('event', 'status_changed')->exists())->toBeTrue();

    $this->patch(route('cemetery-sites.plots.status.update', [
        'cemetery_site_id' => $site,
        'plot_id' => $plot,
    ]), [
        'status' => 'occupied',
        'reason' => 'Manual occupied should fail.',
    ])->assertSessionHasErrors('status');

    workspaceInterment($this->gasan->id, workspaceDecedent(), $plot, '2026-06-20');

    $this->patch(route('cemetery-sites.plots.status.update', [
        'cemetery_site_id' => $site,
        'plot_id' => $plot,
    ]), [
        'status' => 'available',
        'reason' => 'Attempt while occupied.',
    ])->assertSessionHasErrors('status');
});

it('hard deletes an empty standard Plot and hides it from Site inventory', function () {
    activity()->enableLogging();

    $site = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $block = workspaceBlock($this->gasan->id, workspaceSection($this->gasan->id, $site, 'SECTION A'), 'GENERAL');
    $plot = workspacePlot($this->gasan->id, $site, $block, 'LOT 800', 'available');

    $this->delete(route('cemetery-sites.plots.delete', [
        'cemetery_site_id' => $site,
        'plot_id' => $plot,
    ]), [
        'reason' => 'Wrong plot setup.',
    ])->assertRedirect(route('cemetery.admin.sites.workspace.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $site,
    ]));

    $activity = DB::table('activity_log')
        ->where('subject_id', $plot)
        ->where('event', 'plot_deleted')
        ->first();

    expect(DB::table('cemetery_plots')->where('id', $plot)->exists())->toBeFalse()
        ->and($activity)->not->toBeNull()
        ->and((string) $activity->properties)->toContain('Wrong plot setup.')
        ->and((string) $activity->properties)->toContain('LOT 800')
        ->and((string) $activity->properties)->toContain($block)
        ->and((string) $activity->properties)->toContain($site);

    $this->get(route('cemetery.admin.sites.workspace.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $site,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('plots.data', 0)
            ->where('inventory_counts.total', 0));
});

it('blocks deleting Plots with active or soft-deleted cemetery history', function () {
    $site = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $block = workspaceBlock($this->gasan->id, workspaceSection($this->gasan->id, $site, 'SECTION A'), 'GENERAL');
    $intermentPlot = workspacePlot($this->gasan->id, $site, $block, 'LOT 801', 'available');
    $leasePlot = workspacePlot($this->gasan->id, $site, $block, 'LOT 802', 'available');
    $interment = workspaceInterment($this->gasan->id, workspaceDecedent(), $intermentPlot, '2026-06-20');
    $lease = workspaceDetachedLease($this->gasan->id, $leasePlot, 'LEASE HOLDER');

    DB::table('cemetery_interments')->where('id', $interment)->update(['deleted_at' => now()]);
    DB::table('cemetery_plot_leases')->where('id', $lease)->update(['deleted_at' => now()]);

    $this->delete(route('cemetery-sites.plots.delete', [
        'cemetery_site_id' => $site,
        'plot_id' => $intermentPlot,
    ]), [
        'reason' => 'Should stay because interment history exists.',
    ])->assertSessionHasErrors('plot');

    session()->flush();

    $this->delete(route('cemetery-sites.plots.delete', [
        'cemetery_site_id' => $site,
        'plot_id' => $leasePlot,
    ]), [
        'reason' => 'Should stay because lease history exists.',
    ])->assertSessionHasErrors('plot');

    expect(DB::table('cemetery_plots')->whereIn('id', [$intermentPlot, $leasePlot])->whereNotNull('deleted_at')->exists())->toBeFalse();
});

it('hard deletes an unused apartment parent and all child niches atomically', function () {
    activity()->enableLogging();

    $site = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $block = workspaceBlock($this->gasan->id, workspaceSection($this->gasan->id, $site, 'APARTMENT AREA'), 'GENERAL');
    $parent = workspaceApartmentPlot($this->gasan->id, $site, $block, 'APARTMENT A', null, null, null, null, 'slotted', null, 2);
    $firstSlot = workspaceApartmentPlot($this->gasan->id, $site, $block, 'APARTMENT A', $parent, 1, 'R1', 'N01', 'shared', 'available', 5);
    $secondSlot = workspaceApartmentPlot($this->gasan->id, $site, $block, 'APARTMENT A', $parent, 1, 'R1', 'N02', 'shared', 'available', 5);

    $this->delete(route('cemetery-sites.plots.delete', [
        'cemetery_site_id' => $site,
        'plot_id' => $parent,
    ]), [
        'reason' => 'Wrong apartment generated.',
    ])->assertRedirect(route('cemetery.admin.sites.workspace.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $site,
    ]));

    $activity = DB::table('activity_log')
        ->where('subject_id', $parent)
        ->where('event', 'apartment_deleted')
        ->first();

    expect(DB::table('cemetery_plots')->whereIn('id', [$parent, $firstSlot, $secondSlot])->exists())->toBeFalse()
        ->and($activity)->not->toBeNull()
        ->and((string) $activity->properties)->toContain('APARTMENT A')
        ->and((string) $activity->properties)->toContain($block)
        ->and((string) $activity->properties)->toContain($site)
        ->and((string) $activity->properties)->toContain($firstSlot)
        ->and((string) $activity->properties)->toContain($secondSlot);

    $this->post(route('cemetery-sites.blocks.plots.apartment', [
        'cemetery_site_id' => $site,
        'block_id' => $block,
    ]), [
        'apartment_name' => 'APARTMENT A',
        'floors' => 1,
        'rows_per_floor' => 1,
        'niches_per_row' => 1,
        'row_prefix' => 'R',
        'niche_prefix' => 'N',
        'niche_padding' => 2,
        'capacity_per_niche' => 5,
    ])->assertSessionDoesntHaveErrors();

    $replacementParent = Plot::query()
        ->whereNull('deleted_at')
        ->whereNull('parent_plot_id')
        ->where('name', 'APARTMENT A')
        ->sole();

    expect($replacementParent->slots()->where('level', 1)->where('row', 'R1')->where('position', 'N01')->exists())->toBeTrue();
});

it('hard deletes an unused apartment child slot and updates the parent capacity', function () {
    activity()->enableLogging();

    $site = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $block = workspaceBlock($this->gasan->id, workspaceSection($this->gasan->id, $site, 'APARTMENT AREA'), 'GENERAL');
    $parent = workspaceApartmentPlot($this->gasan->id, $site, $block, 'APARTMENT A', null, null, null, null, 'slotted', null, 2);
    $firstSlot = workspaceApartmentPlot($this->gasan->id, $site, $block, 'APARTMENT A', $parent, 1, 'R1', 'N01', 'shared', 'available', 5);

    $this->delete(route('cemetery-sites.plots.delete', [
        'cemetery_site_id' => $site,
        'plot_id' => $firstSlot,
    ]), [
        'reason' => 'Extra niche slot was generated by mistake.',
    ])->assertRedirect(route('cemetery.admin.sites.plots.profile.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $site,
        'plot_id' => $parent,
    ]));

    $activity = DB::table('activity_log')
        ->where('subject_id', $firstSlot)
        ->where('event', 'niche_slot_deleted')
        ->first();

    expect(DB::table('cemetery_plots')->where('id', $firstSlot)->exists())->toBeFalse()
        ->and(DB::table('cemetery_plots')->where('id', $parent)->value('capacity'))->toBe(0)
        ->and($activity)->not->toBeNull()
        ->and((string) $activity->properties)->toContain('Extra niche slot was generated by mistake.')
        ->and((string) $activity->properties)->toContain($parent);
});

it('blocks apartment child slot deletion and parent apartment deletion when a child has history', function () {
    $site = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $block = workspaceBlock($this->gasan->id, workspaceSection($this->gasan->id, $site, 'APARTMENT AREA'), 'GENERAL');
    $parent = workspaceApartmentPlot($this->gasan->id, $site, $block, 'APARTMENT A', null, null, null, null, 'slotted', null, 2);
    $secondSlot = workspaceApartmentPlot($this->gasan->id, $site, $block, 'APARTMENT A', $parent, 1, 'R1', 'N02', 'shared', 'available', 5);

    workspaceInterment($this->gasan->id, workspaceDecedent(), $secondSlot, '2026-06-20');

    $this->delete(route('cemetery-sites.plots.delete', [
        'cemetery_site_id' => $site,
        'plot_id' => $secondSlot,
    ]), [
        'reason' => 'Try deleting used niche.',
    ])->assertSessionHasErrors('plot');

    session()->flush();

    $this->delete(route('cemetery-sites.plots.delete', [
        'cemetery_site_id' => $site,
        'plot_id' => $parent,
    ]), [
        'reason' => 'Try deleting used apartment.',
    ])->assertSessionHasErrors('plot');

    expect(DB::table('cemetery_plots')->whereIn('id', [$parent, $secondSlot])->whereNotNull('deleted_at')->exists())->toBeFalse();
});

it('purges existing soft-deleted unused Plot setup rows through the cleanup command', function () {
    $site = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $block = workspaceBlock($this->gasan->id, workspaceSection($this->gasan->id, $site, 'APARTMENT AREA'), 'GENERAL');
    $parent = workspaceApartmentPlot($this->gasan->id, $site, $block, 'APARTMENT A', null, null, null, null, 'slotted', null, 2);
    $firstSlot = workspaceApartmentPlot($this->gasan->id, $site, $block, 'APARTMENT A', $parent, 1, 'R1', 'N01', 'shared', 'available', 5);
    $secondSlot = workspaceApartmentPlot($this->gasan->id, $site, $block, 'APARTMENT A', $parent, 1, 'R1', 'N02', 'shared', 'available', 5);

    DB::table('cemetery_plots')
        ->whereIn('id', [$parent, $firstSlot, $secondSlot])
        ->update(['deleted_at' => now()]);

    Artisan::call('cemetery:purge-unused-deleted-plots', [
        '--municipal_id' => $this->gasan->id,
    ]);

    expect(DB::table('cemetery_plots')->whereIn('id', [$parent, $firstSlot, $secondSlot])->exists())->toBeFalse();
});

it('fails closed for cross Site and cross tenant Plot deletion attempts', function () {
    $selectedSite = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $siblingSite = workspaceSite($this->gasan->id, 'TIGUION CEMETERY');
    $siblingBlock = workspaceBlock($this->gasan->id, workspaceSection($this->gasan->id, $siblingSite, 'SECTION B'), 'GENERAL');
    $siblingPlot = workspacePlot($this->gasan->id, $siblingSite, $siblingBlock, 'LOT 900', 'available');
    $boacSite = workspaceSite($this->boac->id, 'BOAC CENTRAL');
    $boacBlock = workspaceBlock($this->boac->id, workspaceSection($this->boac->id, $boacSite, 'SECTION A'), 'GENERAL');
    $boacPlot = workspacePlot($this->boac->id, $boacSite, $boacBlock, 'LOT 1', 'available');

    $this->delete(route('cemetery-sites.plots.delete', [
        'cemetery_site_id' => $selectedSite,
        'plot_id' => $siblingPlot,
    ]), [
        'reason' => 'Forged sibling Site delete.',
    ])->assertNotFound();

    $this->delete(route('cemetery-sites.plots.delete', [
        'cemetery_site_id' => $boacSite,
        'plot_id' => $boacPlot,
    ]), [
        'reason' => 'Forged cross tenant delete.',
    ])->assertNotFound();

    expect(DB::table('cemetery_plots')->whereIn('id', [$siblingPlot, $boacPlot])->whereNotNull('deleted_at')->exists())->toBeFalse();
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
    ]), workspacePlotPayload($block, [
        'area_sqm' => '6.50',
    ]));

    $plot = Plot::query()->sole();

    $response->assertRedirect(route('cemetery.admin.sites.workspace.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $site,
    ]));

    expect($plot->cemetery_site_id)->toBe($site)
        ->and($plot->block_id)->toBe($block)
        ->and($plot->area_sqm)->toBe('6.50');
});

it('rejects apartment niche creation through the manual Plot form', function () {
    $site = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $block = workspaceBlock(
        $this->gasan->id,
        workspaceSection($this->gasan->id, $site, 'OLD CEM SOUTH APARTMENT'),
        'GENERAL'
    );

    $this->post(route('cemetery-sites.plots.store', [
        'cemetery_site_id' => $site,
    ]), workspacePlotPayload($block, [
        'name' => 'APARTMENT A',
        'type' => 'apartment_niche',
    ]))->assertSessionHasErrors('type');

    expect(DB::table('cemetery_plots')->where('block_id', $block)->count())->toBe(0);
});

it('creates tenant-scoped Sections from the Site workspace', function () {
    $site = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $siblingSite = workspaceSite($this->gasan->id, 'TIGUION CEMETERY');
    $boacSite = workspaceSite($this->boac->id, 'BOAC CENTRAL');

    $this->post(route('cemetery-sites.sections.store', [
        'cemetery_site_id' => $site,
    ]), [
        'name' => 'new annex',
        'description' => 'Current paper form annex',
    ])->assertRedirect(route('cemetery.admin.sites.workspace.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $site,
    ]));

    expect(DB::table('cemetery_sections')->where('cemetery_site_id', $site)->value('name'))->toBe('NEW ANNEX');

    $this->post(route('cemetery-sites.sections.store', [
        'cemetery_site_id' => $site,
    ]), ['name' => 'NEW ANNEX'])
        ->assertSessionHasErrors('name');

    session()->flush();

    $this->post(route('cemetery-sites.sections.store', [
        'cemetery_site_id' => $siblingSite,
    ]), ['name' => 'NEW ANNEX'])
        ->assertSessionDoesntHaveErrors();

    $this->post(route('cemetery-sites.sections.store', [
        'cemetery_site_id' => $boacSite,
    ]), ['name' => 'FORGED'])
        ->assertNotFound();
});

it('updates tenant-scoped Sections from the Site workspace', function () {
    $site = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $siblingSite = workspaceSite($this->gasan->id, 'TIGUION CEMETERY');
    $boacSite = workspaceSite($this->boac->id, 'BOAC CENTRAL');
    $section = workspaceSection($this->gasan->id, $site, 'NEW ANNEX');
    $duplicate = workspaceSection($this->gasan->id, $site, 'OLD AREA');
    $siblingSection = workspaceSection($this->gasan->id, $siblingSite, 'SIBLING AREA');
    $boacSection = workspaceSection($this->boac->id, $boacSite, 'BOAC AREA');

    $this->patch(route('cemetery-sites.sections.update', [
        'cemetery_site_id' => $site,
        'section_id' => $section,
    ]), [
        'name' => 'new cemetery annex',
        'description' => 'Renamed after caretaker confirmation.',
    ])->assertRedirect(route('cemetery.admin.sites.workspace.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $site,
    ]));

    $updated = DB::table('cemetery_sections')->where('id', $section)->first();

    expect($updated->name)->toBe('NEW CEMETERY ANNEX')
        ->and($updated->description)->toBe('Renamed after caretaker confirmation.');

    $this->patch(route('cemetery-sites.sections.update', [
        'cemetery_site_id' => $site,
        'section_id' => $section,
    ]), [
        'name' => 'OLD AREA',
    ])->assertSessionHasErrors('name');

    session()->flush();

    $this->patch(route('cemetery-sites.sections.update', [
        'cemetery_site_id' => $site,
        'section_id' => $siblingSection,
    ]), [
        'name' => 'FORGED SIBLING',
    ])->assertNotFound();

    $this->patch(route('cemetery-sites.sections.update', [
        'cemetery_site_id' => $boacSite,
        'section_id' => $boacSection,
    ]), [
        'name' => 'FORGED TENANT',
    ])->assertNotFound();

    expect(DB::table('cemetery_sections')->where('id', $duplicate)->value('name'))->toBe('OLD AREA')
        ->and(DB::table('cemetery_sections')->where('id', $siblingSection)->value('name'))->toBe('SIBLING AREA')
        ->and(DB::table('cemetery_sections')->where('id', $boacSection)->value('name'))->toBe('BOAC AREA');
});

it('creates Blocks only inside Sections owned by the selected Site', function () {
    $site = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $siblingSite = workspaceSite($this->gasan->id, 'TIGUION CEMETERY');
    $section = workspaceSection($this->gasan->id, $site, 'NEW ANNEX');
    $siblingSection = workspaceSection($this->gasan->id, $siblingSite, 'OLD AREA');

    $this->post(route('cemetery-sites.sections.blocks.store', [
        'cemetery_site_id' => $site,
        'section_id' => $section,
    ]), ['name' => 'general'])
        ->assertRedirect(route('cemetery.admin.sites.workspace.page', [
            'municipality' => $this->gasan->slug,
            'cemetery_site_id' => $site,
        ]));

    expect(DB::table('cemetery_blocks')->where('section_id', $section)->value('name'))->toBe('GENERAL');

    $this->post(route('cemetery-sites.sections.blocks.store', [
        'cemetery_site_id' => $site,
        'section_id' => $section,
    ]), ['name' => 'GENERAL'])
        ->assertSessionHasErrors('name');

    session()->flush();

    $this->post(route('cemetery-sites.sections.blocks.store', [
        'cemetery_site_id' => $site,
        'section_id' => $siblingSection,
    ]), ['name' => 'FORGED'])
        ->assertSessionHasErrors('section');
});

it('updates Blocks only inside Sections owned by the selected Site', function () {
    $site = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $siblingSite = workspaceSite($this->gasan->id, 'TIGUION CEMETERY');
    $boacSite = workspaceSite($this->boac->id, 'BOAC CENTRAL');
    $section = workspaceSection($this->gasan->id, $site, 'NEW ANNEX');
    $siblingSection = workspaceSection($this->gasan->id, $siblingSite, 'OLD AREA');
    $boacSection = workspaceSection($this->boac->id, $boacSite, 'BOAC AREA');
    $block = workspaceBlock($this->gasan->id, $section, 'GENERAL');
    $duplicate = workspaceBlock($this->gasan->id, $section, 'NORTH');
    $siblingBlock = workspaceBlock($this->gasan->id, $siblingSection, 'SIBLING BLOCK');
    $boacBlock = workspaceBlock($this->boac->id, $boacSection, 'BOAC BLOCK');

    $this->patch(route('cemetery-sites.sections.blocks.update', [
        'cemetery_site_id' => $site,
        'section_id' => $section,
        'block_id' => $block,
    ]), [
        'name' => 'south',
    ])->assertRedirect(route('cemetery.admin.sites.workspace.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $site,
    ]));

    expect(DB::table('cemetery_blocks')->where('id', $block)->value('name'))->toBe('SOUTH');

    $this->patch(route('cemetery-sites.sections.blocks.update', [
        'cemetery_site_id' => $site,
        'section_id' => $section,
        'block_id' => $block,
    ]), [
        'name' => 'NORTH',
    ])->assertSessionHasErrors('name');

    session()->flush();

    $this->patch(route('cemetery-sites.sections.blocks.update', [
        'cemetery_site_id' => $site,
        'section_id' => $section,
        'block_id' => $siblingBlock,
    ]), [
        'name' => 'FORGED SIBLING',
    ])->assertSessionHasErrors('block');

    $this->patch(route('cemetery-sites.sections.blocks.update', [
        'cemetery_site_id' => $boacSite,
        'section_id' => $boacSection,
        'block_id' => $boacBlock,
    ]), [
        'name' => 'FORGED TENANT',
    ])->assertSessionHasErrors('section');

    expect(DB::table('cemetery_blocks')->where('id', $duplicate)->value('name'))->toBe('NORTH')
        ->and(DB::table('cemetery_blocks')->where('id', $siblingBlock)->value('name'))->toBe('SIBLING BLOCK')
        ->and(DB::table('cemetery_blocks')->where('id', $boacBlock)->value('name'))->toBe('BOAC BLOCK');
});

it('bulk-generates Plots by lot-number pattern without partial inserts', function () {
    $site = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $block = workspaceBlock(
        $this->gasan->id,
        workspaceSection($this->gasan->id, $site, 'NEW ANNEX'),
        'GENERAL'
    );

    $payload = [
        'label_prefix' => 'lot',
        'start_number' => 701,
        'quantity' => 3,
        'padding' => 0,
        'type' => 'lawn_lot',
        'capacity' => 1,
        'area_sqm' => '6.00',
        'row' => null,
        'position' => null,
    ];

    $this->post(route('cemetery-sites.blocks.plots.bulk', [
        'cemetery_site_id' => $site,
        'block_id' => $block,
    ]), $payload)
        ->assertRedirect(route('cemetery.admin.sites.workspace.page', [
            'municipality' => $this->gasan->slug,
            'cemetery_site_id' => $site,
        ]));

    expect(DB::table('cemetery_plots')->where('block_id', $block)->orderBy('name')->pluck('name')->all())
        ->toBe(['LOT 701', 'LOT 702', 'LOT 703'])
        ->and(DB::table('cemetery_plots')->where('block_id', $block)->pluck('area_sqm')->map(fn ($value) => (float) $value)->unique()->values()->all())->toBe([6.0]);

    $this->post(route('cemetery-sites.blocks.plots.bulk', [
        'cemetery_site_id' => $site,
        'block_id' => $block,
    ]), $payload)
        ->assertSessionHasErrors('label_prefix');

    expect(DB::table('cemetery_plots')->where('block_id', $block)->count())->toBe(3);
});

it('bulk generation supports shared multi-capacity physical plots', function () {
    $site = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $block = workspaceBlock(
        $this->gasan->id,
        workspaceSection($this->gasan->id, $site, 'MAUSOLEUM AREA'),
        'BLOCK 1'
    );

    $this->post(route('cemetery-sites.blocks.plots.bulk', [
        'cemetery_site_id' => $site,
        'block_id' => $block,
    ]), [
        'label_prefix' => 'MAUSOLEUM',
        'start_number' => 1,
        'quantity' => 2,
        'padding' => 2,
        'type' => 'mausoleum',
        'capacity' => 2,
    ])->assertSessionDoesntHaveErrors();

    expect(DB::table('cemetery_plots')->where('block_id', $block)->whereNull('parent_plot_id')->orderBy('name')->pluck('name')->all())
        ->toBe(['MAUSOLEUM 01', 'MAUSOLEUM 02'])
        ->and(DB::table('cemetery_plots')->where('block_id', $block)->count())->toBe(2)
        ->and(DB::table('cemetery_plots')->where('block_id', $block)->pluck('occupancy_mode')->unique()->values()->all())->toBe(['shared'])
        ->and(DB::table('cemetery_plots')->where('block_id', $block)->pluck('capacity')->unique()->values()->all())->toBe([2]);
});

it('rejects apartment niches through the standard bulk plot generator', function () {
    $site = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $block = workspaceBlock(
        $this->gasan->id,
        workspaceSection($this->gasan->id, $site, 'OLD CEM SOUTH APARTMENT'),
        'GENERAL'
    );

    $this->post(route('cemetery-sites.blocks.plots.bulk', [
        'cemetery_site_id' => $site,
        'block_id' => $block,
    ]), [
        'label_prefix' => 'APT',
        'start_number' => 1,
        'quantity' => 2,
        'padding' => 0,
        'type' => 'apartment_niche',
        'capacity' => 1,
        'area_sqm' => '6.00',
        'row' => null,
        'position' => null,
    ])->assertSessionHasErrors('type');

    expect(DB::table('cemetery_plots')->where('block_id', $block)->count())->toBe(0);
});

it('generates apartment niche containers and floor row niche slots', function () {
    $site = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $block = workspaceBlock(
        $this->gasan->id,
        workspaceSection($this->gasan->id, $site, 'APARTMENT AREA'),
        'BUILDING A'
    );

    $this->post(route('cemetery-sites.blocks.plots.apartment', [
        'cemetery_site_id' => $site,
        'block_id' => $block,
    ]), [
        'apartment_name' => 'apartment a',
        'floors' => 2,
        'rows_per_floor' => 2,
        'niches_per_row' => 3,
        'row_prefix' => 'r',
        'niche_prefix' => 'n',
        'niche_padding' => 2,
        'capacity_per_niche' => 3,
    ])->assertSessionDoesntHaveErrors()
        ->assertRedirect(route('cemetery.admin.sites.workspace.page', [
            'municipality' => $this->gasan->slug,
            'cemetery_site_id' => $site,
        ]));

    $parent = Plot::query()->whereNull('parent_plot_id')->sole();
    $lastSlot = Plot::query()
        ->where('parent_plot_id', $parent->id)
        ->where('level', 2)
        ->where('row', 'R2')
        ->where('position', 'N03')
        ->sole();

    expect($parent->name)->toBe('APARTMENT A')
        ->and($parent->type->value)->toBe('apartment_niche')
        ->and($parent->status)->toBeNull()
        ->and($parent->occupancy_mode->value)->toBe('slotted')
        ->and($parent->capacity)->toBe(12)
        ->and($parent->area_sqm)->toBeNull()
        ->and(DB::table('cemetery_plots')->where('parent_plot_id', $parent->id)->count())->toBe(12)
        ->and($lastSlot->slot_label)->toBe('APARTMENT A-F2-R2-N03')
        ->and($lastSlot->status->value)->toBe('available')
        ->and($lastSlot->occupancy_mode->value)->toBe('shared')
        ->and($lastSlot->capacity)->toBe(3)
        ->and($lastSlot->area_sqm)->toBeNull();
});

it('appends niche slots to an existing apartment parent', function () {
    $site = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $block = workspaceBlock(
        $this->gasan->id,
        workspaceSection($this->gasan->id, $site, 'APARTMENT AREA'),
        'BUILDING A'
    );

    $this->post(route('cemetery-sites.blocks.plots.apartment', [
        'cemetery_site_id' => $site,
        'block_id' => $block,
    ]), [
        'apartment_name' => 'APARTMENT A',
        'floors' => 1,
        'rows_per_floor' => 1,
        'niches_per_row' => 2,
        'row_prefix' => 'R',
        'niche_prefix' => 'N',
        'niche_padding' => 2,
        'capacity_per_niche' => 5,
    ])->assertSessionDoesntHaveErrors();

    $parent = Plot::query()->whereNull('parent_plot_id')->sole();

    $this->post(route('cemetery-sites.plots.niches.store', [
        'cemetery_site_id' => $site,
        'plot_id' => $parent->id,
    ]), [
        'start_floor' => 1,
        'floors' => 1,
        'start_row' => 1,
        'rows_per_floor' => 1,
        'start_niche' => 3,
        'niches_per_row' => 1,
        'row_prefix' => 'R',
        'niche_prefix' => 'N',
        'niche_padding' => 2,
        'capacity_per_niche' => 5,
    ])->assertSessionDoesntHaveErrors();

    $parent->refresh();

    expect(Plot::query()->whereNull('parent_plot_id')->count())->toBe(1)
        ->and($parent->capacity)->toBe(3)
        ->and(Plot::query()->where('parent_plot_id', $parent->id)->where('position', 'N03')->sole()->slot_label)
        ->toBe('APARTMENT A-F1-R1-N03');
});

it('rejects appending apartment slots through the new apartment generator', function () {
    $site = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $block = workspaceBlock(
        $this->gasan->id,
        workspaceSection($this->gasan->id, $site, 'APARTMENT AREA'),
        'BUILDING A'
    );

    $this->post(route('cemetery-sites.blocks.plots.apartment', [
        'cemetery_site_id' => $site,
        'block_id' => $block,
    ]), [
        'apartment_name' => 'APARTMENT A',
        'floors' => 1,
        'rows_per_floor' => 1,
        'niches_per_row' => 1,
        'row_prefix' => 'R',
        'niche_prefix' => 'N',
        'niche_padding' => 2,
        'capacity_per_niche' => 1,
    ])->assertSessionDoesntHaveErrors();

    $parent = Plot::query()->whereNull('parent_plot_id')->sole();

    $this->post(route('cemetery-sites.blocks.plots.apartment', [
        'cemetery_site_id' => $site,
        'block_id' => $block,
    ]), [
        'apartment_parent_id' => $parent->id,
        'apartment_name' => 'APARTMENT A',
        'floors' => 1,
        'rows_per_floor' => 1,
        'niches_per_row' => 1,
        'row_prefix' => 'R',
        'niche_prefix' => 'N',
        'niche_padding' => 2,
        'capacity_per_niche' => 1,
    ])->assertSessionHasErrors('apartment_parent_id');
});

it('rejects duplicate apartment generation without partial inserts', function () {
    $site = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $block = workspaceBlock(
        $this->gasan->id,
        workspaceSection($this->gasan->id, $site, 'APARTMENT AREA'),
        'BUILDING A'
    );
    $payload = [
        'apartment_name' => 'APARTMENT A',
        'floors' => 1,
        'rows_per_floor' => 1,
        'niches_per_row' => 2,
        'row_prefix' => 'R',
        'niche_prefix' => 'N',
        'niche_padding' => 2,
        'capacity_per_niche' => 1,
    ];

    $this->post(route('cemetery-sites.blocks.plots.apartment', [
        'cemetery_site_id' => $site,
        'block_id' => $block,
    ]), $payload)->assertSessionDoesntHaveErrors();

    $this->post(route('cemetery-sites.blocks.plots.apartment', [
        'cemetery_site_id' => $site,
        'block_id' => $block,
    ]), $payload)->assertSessionHasErrors('apartment_name');

    expect(DB::table('cemetery_plots')->where('block_id', $block)->count())->toBe(3);
});

it('rejects apartment generation for inactive Sites and sibling Site Blocks', function () {
    $activeSite = workspaceSite($this->gasan->id, 'GASAN CENTRAL');
    $inactiveSite = workspaceSite($this->gasan->id, 'CLOSED SITE', 'inactive');
    $siblingSite = workspaceSite($this->gasan->id, 'TIGUION CEMETERY');
    $inactiveBlock = workspaceBlock(
        $this->gasan->id,
        workspaceSection($this->gasan->id, $inactiveSite, 'APARTMENT AREA'),
        'BUILDING A'
    );
    $siblingBlock = workspaceBlock(
        $this->gasan->id,
        workspaceSection($this->gasan->id, $siblingSite, 'APARTMENT AREA'),
        'BUILDING B'
    );
    $payload = [
        'apartment_name' => 'APARTMENT A',
        'floors' => 1,
        'rows_per_floor' => 1,
        'niches_per_row' => 2,
        'row_prefix' => 'R',
        'niche_prefix' => 'N',
        'niche_padding' => 2,
        'capacity_per_niche' => 1,
    ];

    $this->post(route('cemetery-sites.blocks.plots.apartment', [
        'cemetery_site_id' => $inactiveSite,
        'block_id' => $inactiveBlock,
    ]), $payload)->assertSessionHasErrors('site');

    session()->flush();

    $this->post(route('cemetery-sites.blocks.plots.apartment', [
        'cemetery_site_id' => $activeSite,
        'block_id' => $siblingBlock,
    ]), $payload)->assertSessionHasErrors('block');

    expect(DB::table('cemetery_plots')->count())->toBe(0);
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
    string $type = 'lawn_lot',
    ?string $row = null,
): string {
    DB::table('cemetery_plots')->insert([
        'id' => $id = (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'cemetery_site_id' => $siteId,
        'block_id' => $blockId,
        'name' => $name,
        'type' => $type,
        'status' => $status,
        'occupancy_mode' => 'single',
        'row' => $row,
        'capacity' => 1,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return $id;
}

function workspacePlotPayload(string $blockId, array $overrides = []): array
{
    return array_merge([
        'block_id' => $blockId,
        'name' => 'PLOT A-1',
        'type' => 'lawn_lot',
        'capacity' => 1,
        'row' => 'A',
        'position' => null,
    ], $overrides);
}

function workspaceDecedent(): string
{
    DB::table('cemetery_decedents')->insert([
        'id' => $id = (string) Str::ulid(),
    ]);

    return $id;
}

function workspaceInterment(string $municipalId, string $decedentId, string $plotId, string $intermentDate): string
{
    DB::table('cemetery_interments')->insert([
        'id' => $id = (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'decedent_id' => $decedentId,
        'plot_id' => $plotId,
        'interment_date' => $intermentDate,
        'type' => 'initial',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return $id;
}

function workspaceLease(string $municipalId, string $intermentId, string $plotId, string $leaseholderName): string
{
    DB::table('cemetery_plot_leases')->insert([
        'id' => $id = (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'created_from_interment_id' => $intermentId,
        'plot_id' => $plotId,
        'leaseholder_name' => $leaseholderName,
        'status' => 'active',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return $id;
}

function workspaceDetachedLease(string $municipalId, string $plotId, string $leaseholderName): string
{
    DB::table('cemetery_plot_leases')->insert([
        'id' => $id = (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'created_from_interment_id' => null,
        'plot_id' => $plotId,
        'leaseholder_name' => $leaseholderName,
        'status' => 'active',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return $id;
}

function workspaceApartmentPlot(
    string $municipalId,
    string $siteId,
    string $blockId,
    string $name,
    ?string $parentPlotId,
    ?int $level,
    ?string $row,
    ?string $position,
    string $occupancyMode,
    ?string $status,
    int $capacity,
): string {
    DB::table('cemetery_plots')->insert([
        'id' => $id = (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'cemetery_site_id' => $siteId,
        'block_id' => $blockId,
        'parent_plot_id' => $parentPlotId,
        'name' => $name,
        'type' => 'apartment_niche',
        'status' => $status,
        'occupancy_mode' => $occupancyMode,
        'row' => $row,
        'level' => $level,
        'position' => $position,
        'capacity' => $capacity,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return $id;
}
