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
            'id' => (string) Str::ulid(),
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
            'id' => (string) Str::ulid(),
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

    $this->get(route('cemetery.admin.sites.workspace.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $site,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('plots.data', 1)
            ->where('plots.data.0.name', 'APARTMENT A')
            ->where('plots.data.0.status', null));

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

it('fails closed when opening another municipality Site', function () {
    $boacSite = workspaceSite($this->boac->id, 'BOAC CENTRAL');

    $this->get(route('cemetery.admin.sites.workspace.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $boacSite,
    ]))->assertNotFound();
});

it('opens a tenant and Site scoped Plot profile with current interments and leaseholders', function () {
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
            ->where('plot.active_interments_count', 2)
            ->where('plot.occupancy_label', '2 / 3')
            ->has('plot.current_interments', 2)
            ->where('plot.current_interments.1.lease.leaseholder_name', 'GRACE SANTOS'));
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

    $this->get(route('cemetery.admin.sites.plots.profile.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $site,
        'plot_id' => $parent,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('plot.id', $parent)
            ->where('plot.occupancy_mode', 'slotted')
            ->has('plot.child_niches', 1)
            ->where('plot.child_niches.0.id', $slot)
            ->where('plot.child_niches.0.slot_label', 'APARTMENT A-F1-R1-N01'));
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
    ])->assertRedirect(route('cemetery.admin.sites.plots.profile.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $site,
        'plot_id' => $plot,
    ]));

    expect(DB::table('cemetery_plots')->where('id', $plot)->value('name'))->toBe('LOT 703')
        ->and(DB::table('cemetery_plots')->where('id', $plot)->value('type'))->toBe('bone_ossuary');

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
        ->toBe(['LOT 701', 'LOT 702', 'LOT 703']);

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
        ->and(DB::table('cemetery_plots')->where('parent_plot_id', $parent->id)->count())->toBe(12)
        ->and($lastSlot->slot_label)->toBe('APARTMENT A-F2-R2-N03')
        ->and($lastSlot->status->value)->toBe('available')
        ->and($lastSlot->occupancy_mode->value)->toBe('shared')
        ->and($lastSlot->capacity)->toBe(3);
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
        'interment_id' => $intermentId,
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
