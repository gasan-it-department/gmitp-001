<?php

use App\Core\Cemetery\Actions\Decedents\GetDecedentProfileAction;
use App\Core\Municipality\Models\Municipality;
use App\Core\Users\Models\User;
use App\External\Api\Resources\Cemetery\Decedents\DecedentDetailsResource;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
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
    Schema::create('media', function (Blueprint $table) {
        $table->id();
        $table->string('model_type');
        $table->ulid('model_id');
        $table->uuid('uuid')->nullable()->unique();
        $table->string('collection_name');
        $table->string('name');
        $table->string('file_name');
        $table->string('mime_type')->nullable();
        $table->string('disk');
        $table->string('conversions_disk')->nullable();
        $table->unsignedBigInteger('size');
        $table->json('manipulations');
        $table->json('custom_properties');
        $table->json('generated_conversions');
        $table->json('responsive_images');
        $table->unsignedInteger('order_column')->nullable();
        $table->timestamps();
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
        require database_path('migrations/2026_06_14_000001_create_cemetery_decedents_table.php'),
        require database_path('migrations/2026_06_14_000002_create_cemetery_sites_table.php'),
        require database_path('migrations/2026_06_14_000003_create_cemetery_sections_table.php'),
        require database_path('migrations/2026_06_14_000004_create_cemetery_blocks_table.php'),
        require database_path('migrations/2026_06_14_000005_create_cemetery_plots_table.php'),
        require database_path('migrations/2026_06_14_000007_create_cemetery_unidentified_details_table.php'),
        require database_path('migrations/2026_06_14_000008_create_cemetery_plot_deeds_table.php'),
        require database_path('migrations/2026_06_14_000009_create_cemetery_interments_table.php'),
        require database_path('migrations/2026_06_14_000010_create_cemetery_service_requests_table.php'),
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

    Schema::dropIfExists('activity_log');
    Schema::dropIfExists('media');
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

it('loads verified unassigned Decedents and available assignable Site Plots on create page', function () {
    $site = intermentSite($this->gasan->id, 'GASAN CENTRAL');
    $siblingSite = intermentSite($this->gasan->id, 'TIGUION CEMETERY');
    $block = intermentBlock($this->gasan->id, intermentSection($this->gasan->id, $site, 'NEW ANNEX'), 'GENERAL');
    $siblingBlock = intermentBlock($this->gasan->id, intermentSection($this->gasan->id, $siblingSite, 'OLD AREA'), 'GENERAL');
    $ready = intermentReadyDecedent($this->gasan->id, 'BRIEFS', 'BULMA');
    $pendingDocuments = intermentVerifiedDecedent($this->gasan->id, 'BRIEFS', 'TRUNKS');
    $alreadyInterred = intermentReadyDecedent($this->gasan->id, 'SON', 'GOTEN');
    $transferredOut = intermentReadyDecedent($this->gasan->id, 'SON', 'GOKU');
    $exhumed = intermentReadyDecedent($this->gasan->id, 'SON', 'GOHAN');
    $availablePlot = intermentPlot($this->gasan->id, $site, $block, 'LOT 701', 'available');
    intermentPlot($this->gasan->id, $site, $block, 'LOT 702', 'occupied');
    intermentPlot($this->gasan->id, $siblingSite, $siblingBlock, 'LOT 999', 'available');
    $usedPlot = intermentPlot($this->gasan->id, $site, $block, 'LOT 703', 'occupied');
    intermentRecord($this->gasan->id, $alreadyInterred, $usedPlot, '2026-06-20');
    intermentRecord($this->gasan->id, $transferredOut, $usedPlot, '2026-06-20', [
        'ended_at' => now(),
        'end_type' => 'transferred_out',
        'end_reason' => 'Transferred to another cemetery.',
    ]);
    intermentRecord($this->gasan->id, $exhumed, $usedPlot, '2026-06-20', [
        'ended_at' => now(),
        'end_type' => 'exhumed',
        'end_reason' => 'Exhumed by family request.',
    ]);

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
            ->has('decedents', 2)
            ->where('decedents.0.id', $ready)
            ->where('decedents.0.readiness_status', 'ready')
            ->where('decedents.0.document_complete', true)
            ->where('decedents.1.id', $pendingDocuments)
            ->where('decedents.1.readiness_status', 'pending_documents')
            ->where('decedents.1.document_complete', false)
            ->has('decedents.1.missing_documents', 2)
            ->has('available_plots', 1)
            ->where('available_plots.0.id', $availablePlot));

    expect($pendingDocuments)->not->toBe($ready);
});

it('stores a Site-scoped interment without creating a Plot lease', function () {
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
        'requesting_party_name' => 'MARIA SANTOS',
        'requesting_party_relationship' => 'CHILD',
    ])->assertRedirect(route('cemetery.admin.sites.plots.profile.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $site,
        'plot_id' => $plot,
    ]));

    expect(DB::table('cemetery_interments')->where('decedent_id', $decedent)->count())->toBe(1)
        ->and(DB::table('cemetery_service_requests')->where('request_type', 'interment')->count())->toBe(1)
        ->and(DB::table('cemetery_plots')->where('id', $plot)->value('status'))->toBe('occupied')
        ->and(DB::table('cemetery_plot_leases')->where('plot_id', $plot)->count())->toBe(0);
});

it('requires leaseholder consent when a different requester creates an interment', function () {
    $site = intermentSite($this->gasan->id, 'GASAN CENTRAL');
    $block = intermentBlock($this->gasan->id, intermentSection($this->gasan->id, $site, 'NEW ANNEX'), 'GENERAL');
    $decedent = intermentReadyDecedent($this->gasan->id, 'SANTOS', 'ROSA');
    $plot = intermentPlot($this->gasan->id, $site, $block, 'LOT 738', 'available');

    DB::table('cemetery_plot_leases')->insert([
        'id' => (string) Str::ulid(),
        'municipal_id' => $this->gasan->id,
        'plot_id' => $plot,
        'leaseholder_name' => 'KAKAROT SHIPUDEN',
        'leaseholder_contact' => '09994587692',
        'leaseholder_relationship' => 'CHILD',
        'status' => 'active',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $this->post(route('interments.store'), intermentPayload($site, $decedent, $plot, [
        'requesting_party_name' => 'VEGETA PRINCE',
        'requesting_party_relationship' => 'REPRESENTATIVE',
    ]))->assertSessionHasErrors([
        'leaseholder_consent_confirmed',
        'leaseholder_consent_method',
        'leaseholder_consent_reference',
    ]);

    expect(DB::table('cemetery_interments')->where('decedent_id', $decedent)->count())->toBe(0)
        ->and(DB::table('cemetery_service_requests')->count())->toBe(0)
        ->and(DB::table('cemetery_plots')->where('id', $plot)->value('status'))->toBe('available');

    $this->post(route('interments.store'), intermentPayload($site, $decedent, $plot, [
        'requesting_party_name' => 'VEGETA PRINCE',
        'requesting_party_relationship' => 'REPRESENTATIVE',
        'leaseholder_consent_confirmed' => true,
        'leaseholder_consent_method' => 'verbal_authorization',
        'leaseholder_consent_reference' => 'APPROVED BY PHONE CALL WITH ADMIN HEAD',
    ]))->assertRedirect();

    $serviceRequest = DB::table('cemetery_service_requests')->first();

    expect(DB::table('cemetery_interments')->where('decedent_id', $decedent)->count())->toBe(1)
        ->and($serviceRequest?->request_type)->toBe('interment')
        ->and($serviceRequest?->requesting_party_name)->toBe('VEGETA PRINCE')
        ->and((bool) $serviceRequest?->requester_is_leaseholder)->toBeFalse()
        ->and($serviceRequest?->leaseholder_name_snapshot)->toBe('KAKAROT SHIPUDEN')
        ->and((bool) $serviceRequest?->leaseholder_consent_confirmed)->toBeTrue()
        ->and($serviceRequest?->leaseholder_consent_method)->toBe('verbal_authorization')
        ->and($serviceRequest?->leaseholder_consent_reference)->toBe('APPROVED BY PHONE CALL WITH ADMIN HEAD');
});

it('requires pending-document authorization when a verified decedent has missing documents', function () {
    $site = intermentSite($this->gasan->id, 'GASAN CENTRAL');
    $block = intermentBlock($this->gasan->id, intermentSection($this->gasan->id, $site, 'NEW ANNEX'), 'GENERAL');
    $decedent = intermentVerifiedDecedent($this->gasan->id, 'SANTOS', 'MARIO');
    $plot = intermentPlot($this->gasan->id, $site, $block, 'LOT 740', 'available');

    $this->post(route('interments.store'), intermentPayload($site, $decedent, $plot))
        ->assertSessionHasErrors([
            'pending_document_reason',
            'pending_document_reference',
            'pending_document_confirmed',
        ]);

    expect(DB::table('cemetery_interments')->where('decedent_id', $decedent)->count())->toBe(0)
        ->and(DB::table('cemetery_interment_readiness_overrides')->where('decedent_id', $decedent)->count())->toBe(0)
        ->and(DB::table('cemetery_plots')->where('id', $plot)->value('status'))->toBe('available');
});

it('records and immediately consumes pending-document authorization during interment', function () {
    $user = intermentStaffUser();
    $this->actingAs($user);

    $site = intermentSite($this->gasan->id, 'GASAN CENTRAL');
    $block = intermentBlock($this->gasan->id, intermentSection($this->gasan->id, $site, 'NEW ANNEX'), 'GENERAL');
    $decedent = intermentVerifiedDecedent($this->gasan->id, 'SANTOS', 'LUIGI');
    $plot = intermentPlot($this->gasan->id, $site, $block, 'LOT 741', 'available');

    $this->post(route('interments.store'), intermentPayload($site, $decedent, $plot, [
        'pending_document_reason' => 'Burial allowed by admin; documents to follow',
        'pending_document_reference' => 'Approved by admin head',
        'pending_document_confirmed' => true,
    ]))->assertRedirect(route('cemetery.admin.sites.plots.profile.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $site,
        'plot_id' => $plot,
    ]));

    $interment = DB::table('cemetery_interments')->where('decedent_id', $decedent)->first();
    $authorization = DB::table('cemetery_interment_readiness_overrides')->where('decedent_id', $decedent)->first();

    expect($interment)->not->toBeNull()
        ->and($authorization)->not->toBeNull()
        ->and($authorization->reason)->toBe('Burial allowed by admin; documents to follow')
        ->and($authorization->evidence_reference)->toBe('APPROVED BY ADMIN HEAD')
        ->and($authorization->consumed_at)->not->toBeNull()
        ->and($authorization->created_by)->toBe($user->id)
        ->and($authorization->consumed_by)->toBe($user->id)
        ->and($authorization->consumed_by_interment_id)->toBe($interment->id);
});

it('rejects normal interment creation for Decedents with final cemetery outcomes', function () {
    $site = intermentSite($this->gasan->id, 'GASAN CENTRAL');
    $block = intermentBlock($this->gasan->id, intermentSection($this->gasan->id, $site, 'NEW ANNEX'), 'GENERAL');
    $decedent = intermentReadyDecedent($this->gasan->id, 'SANTOS', 'OUT');
    $oldPlot = intermentPlot($this->gasan->id, $site, $block, 'LOT 742', 'available');
    $newPlot = intermentPlot($this->gasan->id, $site, $block, 'LOT 743', 'available');

    intermentRecord($this->gasan->id, $decedent, $oldPlot, '2026-06-20', [
        'ended_at' => now(),
        'end_type' => 'transferred_out',
        'end_reason' => 'Transferred to another cemetery.',
    ]);

    $this->post(route('interments.store'), intermentPayload($site, $decedent, $newPlot))
        ->assertSessionHasErrors('decedent_id');

    expect(DB::table('cemetery_interments')->where('decedent_id', $decedent)->count())->toBe(1)
        ->and(DB::table('cemetery_plots')->where('id', $newPlot)->value('status'))->toBe('available');
});

it('moves an active interment to another plot in the same Site and preserves the ended source history', function () {
    activity()->enableLogging();

    $site = intermentSite($this->gasan->id, 'GASAN CENTRAL');
    $block = intermentBlock($this->gasan->id, intermentSection($this->gasan->id, $site, 'NEW ANNEX'), 'GENERAL');
    $decedent = intermentReadyDecedent($this->gasan->id, 'SANTOS', 'JUAN');
    $sourcePlot = intermentPlot($this->gasan->id, $site, $block, 'LOT 737', 'occupied');
    $destinationPlot = intermentPlot($this->gasan->id, $site, $block, 'LOT 738', 'available');
    $sourceInterment = intermentRecord($this->gasan->id, $decedent, $sourcePlot, '2026-06-20');

    Storage::fake('local');

    $this->post(route('interments.move', ['interment_id' => $sourceInterment]), movePayload($site, $destinationPlot, [
        'notes' => 'Moved after caretaker confirmation.',
        'authorization_evidence' => UploadedFile::fake()->image('authorization.jpg'),
    ]))->assertRedirect(route('cemetery.admin.sites.plots.profile.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $site,
        'plot_id' => $destinationPlot,
    ]));

    $source = DB::table('cemetery_interments')->where('id', $sourceInterment)->first();
    $transfer = DB::table('cemetery_interments')->where('previous_interment_id', $sourceInterment)->first();

    expect($source->ended_at)->not->toBeNull()
        ->and($source->end_type)->toBe('moved')
        ->and($source->end_reason)->toBe('Family requested relocation.')
        ->and($transfer)->not->toBeNull()
        ->and($transfer->plot_id)->toBe($destinationPlot)
        ->and($transfer->type)->toBe('transfer')
        ->and($transfer->voided_at)->toBeNull()
        ->and(DB::table('cemetery_plots')->where('id', $sourcePlot)->value('status'))->toBe('available')
        ->and(DB::table('cemetery_plots')->where('id', $destinationPlot)->value('status'))->toBe('occupied')
        ->and(DB::table('cemetery_service_requests')->where('requestable_id', $transfer->id)->where('request_type', 'plot_move')->count())->toBe(1)
        ->and(DB::table('media')->where('collection_name', 'authorization_evidence')->count())->toBe(1)
        ->and(DB::table('activity_log')->where('event', 'interment_moved')->exists())->toBeTrue();

    $this->get(route('cemetery.admin.sites.plots.profile.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $site,
        'plot_id' => $sourcePlot,
    ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('plot.id', $sourcePlot)
            ->has('plot.current_interments', 0)
            ->has('plot.interment_history', 1)
            ->where('plot.interment_history.0.decedent_name', 'SANTOS, JUAN')
            ->where('plot.interment_history.0.status_label', 'Moved out')
            ->where('plot.interment_history.0.destination_plot_label', 'LOT 738')
            ->where('plot.interment_history.0.end_reason', 'Family requested relocation.')
            ->where('plot.interment_history.0.end_notes', 'Moved after caretaker confirmation.'));
});

it('moves an active interment to another Cemetery Site in the same municipality', function () {
    $sourceSite = intermentSite($this->gasan->id, 'GASAN CENTRAL');
    $destinationSite = intermentSite($this->gasan->id, 'TIGUION CEMETERY');
    $sourceBlock = intermentBlock($this->gasan->id, intermentSection($this->gasan->id, $sourceSite, 'NEW ANNEX'), 'GENERAL');
    $destinationBlock = intermentBlock($this->gasan->id, intermentSection($this->gasan->id, $destinationSite, 'SECTION A'), 'GENERAL');
    $decedent = intermentReadyDecedent($this->gasan->id, 'REYES', 'ANA');
    $sourcePlot = intermentPlot($this->gasan->id, $sourceSite, $sourceBlock, 'LOT 1', 'occupied');
    $destinationPlot = intermentPlot($this->gasan->id, $destinationSite, $destinationBlock, 'LOT 9', 'available');
    $sourceInterment = intermentRecord($this->gasan->id, $decedent, $sourcePlot, '2026-06-20');

    $this->post(route('interments.move', ['interment_id' => $sourceInterment]), movePayload($destinationSite, $destinationPlot, [
        'reason' => 'Moved to another municipal cemetery site.',
    ]))->assertRedirect(route('cemetery.admin.sites.plots.profile.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $destinationSite,
        'plot_id' => $destinationPlot,
    ]));

    expect(DB::table('cemetery_interments')->where('decedent_id', $decedent)->whereNull('ended_at')->whereNull('voided_at')->value('plot_id'))
        ->toBe($destinationPlot);
});

it('requires destination leaseholder consent when a different requester moves an interment', function () {
    $site = intermentSite($this->gasan->id, 'GASAN CENTRAL');
    $block = intermentBlock($this->gasan->id, intermentSection($this->gasan->id, $site, 'NEW ANNEX'), 'GENERAL');
    $decedent = intermentReadyDecedent($this->gasan->id, 'SON', 'GOKU');
    $sourcePlot = intermentPlot($this->gasan->id, $site, $block, 'LOT 737', 'occupied');
    $destinationPlot = intermentPlot($this->gasan->id, $site, $block, 'LOT 738', 'available');
    $sourceInterment = intermentRecord($this->gasan->id, $decedent, $sourcePlot, '2026-06-20');
    intermentLease($this->gasan->id, $destinationPlot, 'KAKAROT SHIPUDEN');

    $this->post(route('interments.move', ['interment_id' => $sourceInterment]), movePayload($site, $destinationPlot, [
        'requesting_party_name' => 'VEGETA PRINCE',
        'requesting_party_relationship' => 'REPRESENTATIVE',
    ]))->assertSessionHasErrors([
        'leaseholder_consent_confirmed',
        'leaseholder_consent_method',
        'leaseholder_consent_reference',
    ]);

    expect(DB::table('cemetery_interments')->where('previous_interment_id', $sourceInterment)->count())->toBe(0)
        ->and(DB::table('cemetery_interments')->where('id', $sourceInterment)->value('ended_at'))->toBeNull()
        ->and(DB::table('cemetery_service_requests')->count())->toBe(0);

    $this->post(route('interments.move', ['interment_id' => $sourceInterment]), movePayload($site, $destinationPlot, [
        'requesting_party_name' => 'VEGETA PRINCE',
        'requesting_party_relationship' => 'REPRESENTATIVE',
        'leaseholder_consent_confirmed' => true,
        'leaseholder_consent_method' => 'verbal_authorization',
        'leaseholder_consent_reference' => 'APPROVED BY PHONE CALL WITH ADMIN HEAD',
    ]))->assertRedirect();

    $transfer = DB::table('cemetery_interments')->where('previous_interment_id', $sourceInterment)->first();
    $serviceRequest = DB::table('cemetery_service_requests')->where('requestable_id', $transfer->id)->first();

    expect($serviceRequest?->request_type)->toBe('plot_move')
        ->and($serviceRequest?->leaseholder_name_snapshot)->toBe('KAKAROT SHIPUDEN')
        ->and((bool) $serviceRequest?->requester_is_leaseholder)->toBeFalse()
        ->and((bool) $serviceRequest?->leaseholder_consent_confirmed)->toBeTrue()
        ->and($serviceRequest?->leaseholder_consent_method)->toBe('verbal_authorization')
        ->and($serviceRequest?->leaseholder_consent_reference)->toBe('APPROVED BY PHONE CALL WITH ADMIN HEAD');
});

it('falls back to source leaseholder consent when destination has no active lease', function () {
    $site = intermentSite($this->gasan->id, 'GASAN CENTRAL');
    $block = intermentBlock($this->gasan->id, intermentSection($this->gasan->id, $site, 'NEW ANNEX'), 'GENERAL');
    $decedent = intermentReadyDecedent($this->gasan->id, 'SON', 'GOHAN');
    $sourcePlot = intermentPlot($this->gasan->id, $site, $block, 'LOT 801', 'occupied');
    $destinationPlot = intermentPlot($this->gasan->id, $site, $block, 'LOT 802', 'available');
    $sourceInterment = intermentRecord($this->gasan->id, $decedent, $sourcePlot, '2026-06-20');
    intermentLease($this->gasan->id, $sourcePlot, 'CHI CHI SON');

    $this->post(route('interments.move', ['interment_id' => $sourceInterment]), movePayload($site, $destinationPlot))
        ->assertSessionHasErrors([
            'leaseholder_consent_confirmed',
            'leaseholder_consent_method',
            'leaseholder_consent_reference',
        ]);

    $this->post(route('interments.move', ['interment_id' => $sourceInterment]), movePayload($site, $destinationPlot, [
        'requester_is_leaseholder' => true,
    ]))->assertRedirect();

    $transfer = DB::table('cemetery_interments')->where('previous_interment_id', $sourceInterment)->first();
    $serviceRequest = DB::table('cemetery_service_requests')->where('requestable_id', $transfer->id)->first();

    expect($serviceRequest?->leaseholder_name_snapshot)->toBe('CHI CHI SON')
        ->and((bool) $serviceRequest?->requester_is_leaseholder)->toBeTrue()
        ->and($serviceRequest?->leaseholder_consent_method)->toBe('leaseholder_present');
});

it('rejects invalid interment move destinations and inactive source rows', function () {
    $site = intermentSite($this->gasan->id, 'GASAN CENTRAL');
    $block = intermentBlock($this->gasan->id, intermentSection($this->gasan->id, $site, 'NEW ANNEX'), 'GENERAL');
    $decedent = intermentReadyDecedent($this->gasan->id, 'BRIEFS', 'BULMA');
    $sourcePlot = intermentPlot($this->gasan->id, $site, $block, 'LOT 1', 'occupied');
    $fullSharedPlot = intermentPlot($this->gasan->id, $site, $block, 'LOT 2', 'occupied', 'shared', 1);
    $maintenancePlot = intermentPlot($this->gasan->id, $site, $block, 'LOT 3', 'maintenance');
    $slottedPlot = intermentPlot($this->gasan->id, $site, $block, 'APARTMENT A', null, 'slotted', 10, 'apartment_niche');
    $boacSite = intermentSite($this->boac->id, 'BOAC CENTRAL');
    $boacBlock = intermentBlock($this->boac->id, intermentSection($this->boac->id, $boacSite, 'SECTION A'), 'GENERAL');
    $boacPlot = intermentPlot($this->boac->id, $boacSite, $boacBlock, 'LOT 1', 'available');
    $sourceInterment = intermentRecord($this->gasan->id, $decedent, $sourcePlot, '2026-06-20');
    intermentRecord($this->gasan->id, intermentReadyDecedent($this->gasan->id, 'BRIEFS', 'TRUNKS'), $fullSharedPlot, '2026-06-21');

    $payload = [
        'destination_cemetery_site_id' => $site,
        'movement_date' => '2026-06-25',
        'reason' => 'Invalid move test.',
        'requesting_party_name' => 'MARIA SANTOS',
        'requesting_party_relationship' => 'CHILD',
    ];

    $this->post(route('interments.move', ['interment_id' => $sourceInterment]), $payload + [
        'destination_plot_id' => $sourcePlot,
    ])->assertSessionHasErrors('destination_plot_id');

    session()->flush();

    $this->post(route('interments.move', ['interment_id' => $sourceInterment]), $payload + [
        'destination_plot_id' => $fullSharedPlot,
    ])->assertSessionHasErrors('destination_plot_id');

    session()->flush();

    $this->post(route('interments.move', ['interment_id' => $sourceInterment]), $payload + [
        'destination_plot_id' => $maintenancePlot,
    ])->assertSessionHasErrors('destination_plot_id');

    session()->flush();

    $this->post(route('interments.move', ['interment_id' => $sourceInterment]), $payload + [
        'destination_plot_id' => $slottedPlot,
    ])->assertSessionHasErrors('destination_plot_id');

    session()->flush();

    $this->post(route('interments.move', ['interment_id' => $sourceInterment]), movePayload($boacSite, $boacPlot, [
        'reason' => 'Cross tenant attempt.',
    ]))->assertSessionHasErrors('destination_cemetery_site_id');

    DB::table('cemetery_interments')->where('id', $sourceInterment)->update(['ended_at' => now()]);
    session()->flush();

    $this->post(route('interments.move', ['interment_id' => $sourceInterment]), $payload + [
        'destination_plot_id' => intermentPlot($this->gasan->id, $site, $block, 'LOT 4', 'available'),
    ])->assertSessionHasErrors('interment');
});

it('reverses a mistaken moved interment and restores the previous plot', function () {
    activity()->enableLogging();

    $site = intermentSite($this->gasan->id, 'GASAN CENTRAL');
    $block = intermentBlock($this->gasan->id, intermentSection($this->gasan->id, $site, 'NEW ANNEX'), 'GENERAL');
    $decedent = intermentReadyDecedent($this->gasan->id, 'SON', 'GOKU');
    $sourcePlot = intermentPlot($this->gasan->id, $site, $block, 'LOT 1', 'occupied');
    $destinationPlot = intermentPlot($this->gasan->id, $site, $block, 'LOT 2', 'available');
    $sourceInterment = intermentRecord($this->gasan->id, $decedent, $sourcePlot, '2026-06-20');

    $this->post(route('interments.move', ['interment_id' => $sourceInterment]), movePayload($site, $destinationPlot, [
        'reason' => 'Wrong plot selected.',
    ]))->assertRedirect();

    $transfer = DB::table('cemetery_interments')->where('previous_interment_id', $sourceInterment)->first();

    $this->patch(route('interments.reverse-move', ['interment_id' => $transfer->id]), [
        'reason' => 'Encoder selected the wrong destination plot.',
    ])->assertRedirect(route('cemetery.admin.sites.plots.profile.page', [
        'municipality' => $this->gasan->slug,
        'cemetery_site_id' => $site,
        'plot_id' => $sourcePlot,
    ]));

    expect(DB::table('cemetery_interments')->where('id', $transfer->id)->value('voided_at'))->not->toBeNull()
        ->and(DB::table('cemetery_interments')->where('id', $sourceInterment)->value('ended_at'))->toBeNull()
        ->and(DB::table('cemetery_interments')->where('id', $sourceInterment)->value('end_type'))->toBeNull()
        ->and(DB::table('cemetery_plots')->where('id', $sourcePlot)->value('status'))->toBe('occupied')
        ->and(DB::table('cemetery_plots')->where('id', $destinationPlot)->value('status'))->toBe('available')
        ->and(DB::table('activity_log')->where('event', 'interment_move_reversed')->exists())->toBeTrue();
});

it('rejects move reversal when the previous plot can no longer accept the restored interment', function () {
    $site = intermentSite($this->gasan->id, 'GASAN CENTRAL');
    $block = intermentBlock($this->gasan->id, intermentSection($this->gasan->id, $site, 'NEW ANNEX'), 'GENERAL');
    $decedent = intermentReadyDecedent($this->gasan->id, 'SON', 'GOHAN');
    $sourcePlot = intermentPlot($this->gasan->id, $site, $block, 'LOT 1', 'occupied');
    $destinationPlot = intermentPlot($this->gasan->id, $site, $block, 'LOT 2', 'available');
    $sourceInterment = intermentRecord($this->gasan->id, $decedent, $sourcePlot, '2026-06-20');

    $this->post(route('interments.move', ['interment_id' => $sourceInterment]), movePayload($site, $destinationPlot, [
        'reason' => 'Move before conflict.',
    ]))->assertRedirect();

    $transfer = DB::table('cemetery_interments')->where('previous_interment_id', $sourceInterment)->first();
    intermentRecord($this->gasan->id, intermentReadyDecedent($this->gasan->id, 'SON', 'GOTEN'), $sourcePlot, '2026-06-26');
    DB::table('cemetery_plots')->where('id', $sourcePlot)->update(['status' => 'occupied']);

    $this->patch(route('interments.reverse-move', ['interment_id' => $transfer->id]), [
        'reason' => 'Try to reverse after source plot reuse.',
    ])->assertSessionHasErrors('interment');

    expect(DB::table('cemetery_interments')->where('id', $transfer->id)->value('voided_at'))->toBeNull()
        ->and(DB::table('cemetery_interments')->where('id', $sourceInterment)->value('ended_at'))->not->toBeNull();
});

it('exhumes an active interment and frees a single plot while preserving history', function () {
    activity()->enableLogging();
    Storage::fake('local');

    $site = intermentSite($this->gasan->id, 'GASAN CENTRAL');
    $block = intermentBlock($this->gasan->id, intermentSection($this->gasan->id, $site, 'NEW ANNEX'), 'GENERAL');
    $decedent = intermentReadyDecedent($this->gasan->id, 'DELACRUZ', 'PEDRO');
    $plot = intermentPlot($this->gasan->id, $site, $block, 'LOT 40', 'occupied');
    $interment = intermentRecord($this->gasan->id, $decedent, $plot, '2026-06-20');
    intermentLease($this->gasan->id, $plot, 'MARIA SANTOS');

    $this->from(route('cemetery.admin.decedents.profile.page', [
        'municipality' => $this->gasan->slug,
        'decedent_id' => $decedent,
    ]))->post(route('interments.close', ['interment_id' => $interment]), closePayload([
        '_method' => 'patch',
        'end_type' => 'exhumed',
        'ended_date' => '2026-06-30',
        'reason' => 'Court-authorized exhumation.',
        'permit_reference' => 'EXH-2026-001',
        'notes' => 'Witnessed by cemetery caretaker.',
        'requester_is_leaseholder' => false,
        'leaseholder_consent_confirmed' => true,
        'leaseholder_consent_method' => 'written_authorization',
        'leaseholder_consent_reference' => 'SIGNED EXHUMATION LETTER',
        'authorization_evidence' => UploadedFile::fake()->image('exhumation-authorization.jpg'),
    ]))->assertRedirect(route('cemetery.admin.decedents.profile.page', [
        'municipality' => $this->gasan->slug,
        'decedent_id' => $decedent,
    ]));

    $closed = DB::table('cemetery_interments')->where('id', $interment)->first();

    expect($closed->ended_at)->not->toBeNull()
        ->and($closed->end_type)->toBe('exhumed')
        ->and($closed->end_reason)->toBe('Court-authorized exhumation.')
        ->and($closed->permit_reference)->toBe('EXH-2026-001')
        ->and(DB::table('cemetery_interments')->where('decedent_id', $decedent)->whereNull('ended_at')->whereNull('voided_at')->exists())->toBeFalse()
        ->and(DB::table('cemetery_plots')->where('id', $plot)->value('status'))->toBe('available')
        ->and(DB::table('activity_log')->where('event', 'interment_closed')->exists())->toBeTrue()
        ->and(DB::table('cemetery_service_requests')->where('requestable_id', $interment)->where('request_type', 'exhumation')->count())->toBe(1)
        ->and(DB::table('media')->where('collection_name', 'authorization_evidence')->count())->toBe(1);

    $profile = (new DecedentDetailsResource((new GetDecedentProfileAction)->execute($decedent, $this->gasan->id)))->resolve();

    expect($profile['interment'])->toBeNull()
        ->and($profile['interment_history'][0]['lifecycle_status'])->toBe('exhumed')
        ->and($profile['interment_history'][0]['permit_reference'])->toBe('EXH-2026-001');
});

it('transfers an interment out and keeps a shared plot occupied when others remain', function () {
    $site = intermentSite($this->gasan->id, 'GASAN CENTRAL');
    $block = intermentBlock($this->gasan->id, intermentSection($this->gasan->id, $site, 'FAMILY LOTS'), 'GENERAL');
    $firstDecedent = intermentReadyDecedent($this->gasan->id, 'SANTOS', 'ANA');
    $secondDecedent = intermentReadyDecedent($this->gasan->id, 'SANTOS', 'BEN');
    $plot = intermentPlot($this->gasan->id, $site, $block, 'FAMILY LOT 1', 'occupied', 'shared', 2);
    $firstInterment = intermentRecord($this->gasan->id, $firstDecedent, $plot, '2026-06-20');
    intermentRecord($this->gasan->id, $secondDecedent, $plot, '2026-06-21');

    $this->patch(route('interments.close', ['interment_id' => $firstInterment]), closePayload([
        'end_type' => 'transferred_out',
        'ended_date' => '2026-06-30',
        'reason' => 'Family transfer outside municipality.',
        'transfer_destination' => 'BOAC MUNICIPAL CEMETERY',
        'permit_reference' => 'TO-2026-001',
    ]))->assertRedirect();

    $closed = DB::table('cemetery_interments')->where('id', $firstInterment)->first();

    expect($closed->end_type)->toBe('transferred_out')
        ->and($closed->transfer_destination)->toBe('BOAC MUNICIPAL CEMETERY')
        ->and($closed->permit_reference)->toBe('TO-2026-001')
        ->and(DB::table('cemetery_plots')->where('id', $plot)->value('status'))->toBe('occupied')
        ->and(DB::table('cemetery_interments')->where('plot_id', $plot)->whereNull('ended_at')->whereNull('voided_at')->count())->toBe(1)
        ->and(DB::table('cemetery_service_requests')->where('requestable_id', $firstInterment)->where('request_type', 'transfer_out')->count())->toBe(1);
});

it('requires active leaseholder consent when a different requester closes an interment', function () {
    $site = intermentSite($this->gasan->id, 'GASAN CENTRAL');
    $block = intermentBlock($this->gasan->id, intermentSection($this->gasan->id, $site, 'NEW ANNEX'), 'GENERAL');
    $decedent = intermentReadyDecedent($this->gasan->id, 'SON', 'GOHAN');
    $plot = intermentPlot($this->gasan->id, $site, $block, 'LOT 41', 'occupied');
    $interment = intermentRecord($this->gasan->id, $decedent, $plot, '2026-06-20');
    intermentLease($this->gasan->id, $plot, 'CHI CHI');

    $this->patch(route('interments.close', ['interment_id' => $interment]), closePayload([
        'requesting_party_name' => 'GOKU SON',
        'requesting_party_relationship' => 'SPOUSE',
        'requester_is_leaseholder' => false,
    ]))->assertSessionHasErrors([
        'leaseholder_consent_confirmed',
        'leaseholder_consent_method',
        'leaseholder_consent_reference',
    ]);

    expect(DB::table('cemetery_interments')->where('id', $interment)->value('ended_at'))->toBeNull()
        ->and(DB::table('cemetery_service_requests')->count())->toBe(0);

    session()->flush();

    $this->patch(route('interments.close', ['interment_id' => $interment]), closePayload([
        'requesting_party_name' => 'CHI CHI',
        'requesting_party_relationship' => 'LEASEHOLDER',
        'requester_is_leaseholder' => true,
    ]))->assertRedirect();

    $serviceRequest = DB::table('cemetery_service_requests')->where('requestable_id', $interment)->first();

    expect($serviceRequest?->request_type)->toBe('exhumation')
        ->and((bool) $serviceRequest?->requester_is_leaseholder)->toBeTrue()
        ->and($serviceRequest?->leaseholder_consent_method)->toBe('leaseholder_present');
});

it('rejects invalid interment close requests', function () {
    $site = intermentSite($this->gasan->id, 'GASAN CENTRAL');
    $block = intermentBlock($this->gasan->id, intermentSection($this->gasan->id, $site, 'NEW ANNEX'), 'GENERAL');
    $decedent = intermentReadyDecedent($this->gasan->id, 'BRIEFS', 'VEGETA');
    $plot = intermentPlot($this->gasan->id, $site, $block, 'LOT 90', 'occupied');
    $interment = intermentRecord($this->gasan->id, $decedent, $plot, '2026-06-20');

    $this->patch(route('interments.close', ['interment_id' => $interment]), closePayload([
        'end_type' => 'transferred_out',
        'ended_date' => '2026-06-30',
        'reason' => 'Missing destination.',
    ]))->assertSessionHasErrors('transfer_destination');

    session()->flush();

    $this->patch(route('interments.close', ['interment_id' => $interment]), closePayload([
        'end_type' => 'moved',
        'ended_date' => '2026-06-30',
        'reason' => 'Wrong flow.',
    ]))->assertSessionHasErrors('end_type');

    DB::table('cemetery_interments')->where('id', $interment)->update([
        'ended_at' => now(),
        'end_type' => 'exhumed',
    ]);
    session()->flush();

    $this->patch(route('interments.close', ['interment_id' => $interment]), closePayload([
        'end_type' => 'exhumed',
        'ended_date' => '2026-06-30',
        'reason' => 'Try again.',
    ]))->assertSessionHasErrors('interment');
});

it('voids a wrong active interment and frees the plot for normal reassignment', function () {
    $site = intermentSite($this->gasan->id, 'GASAN CENTRAL');
    $block = intermentBlock($this->gasan->id, intermentSection($this->gasan->id, $site, 'NEW ANNEX'), 'GENERAL');
    $wrongDecedent = intermentReadyDecedent($this->gasan->id, 'SON', 'GOTEN');
    $plot = intermentPlot($this->gasan->id, $site, $block, 'LOT 800', 'occupied');
    $interment = intermentRecord($this->gasan->id, $wrongDecedent, $plot, '2026-06-20');

    $this->from(route('cemetery.admin.decedents.profile.page', [
        'municipality' => $this->gasan->slug,
        'decedent_id' => $wrongDecedent,
    ]))->patch(route('interments.void', ['interment_id' => $interment]), [
        'reason' => 'Wrong Decedent was selected during encoding.',
    ])->assertRedirect(route('cemetery.admin.decedents.profile.page', [
        'municipality' => $this->gasan->slug,
        'decedent_id' => $wrongDecedent,
    ]));

    $voided = DB::table('cemetery_interments')->where('id', $interment)->first();

    expect($voided->voided_at)->not->toBeNull()
        ->and($voided->void_reason)->toBe('Wrong Decedent was selected during encoding.')
        ->and(DB::table('cemetery_interments')->where('decedent_id', $wrongDecedent)->whereNull('ended_at')->whereNull('voided_at')->exists())->toBeFalse()
        ->and(DB::table('cemetery_plots')->where('id', $plot)->value('status'))->toBe('available');

    $profile = (new DecedentDetailsResource((new GetDecedentProfileAction)->execute($wrongDecedent, $this->gasan->id)))->resolve();

    expect($profile['interment'])->toBeNull()
        ->and($profile['interment_history'][0]['lifecycle_status'])->toBe('voided')
        ->and($profile['interment_history'][0]['void_reason'])->toBe('Wrong Decedent was selected during encoding.');
});

it('rejects voiding ended voided or cross tenant interments', function () {
    $site = intermentSite($this->gasan->id, 'GASAN CENTRAL');
    $block = intermentBlock($this->gasan->id, intermentSection($this->gasan->id, $site, 'NEW ANNEX'), 'GENERAL');
    $endedDecedent = intermentReadyDecedent($this->gasan->id, 'ENDED', 'ONE');
    $voidedDecedent = intermentReadyDecedent($this->gasan->id, 'VOIDED', 'ONE');
    $endedPlot = intermentPlot($this->gasan->id, $site, $block, 'LOT 801', 'available');
    $voidedPlot = intermentPlot($this->gasan->id, $site, $block, 'LOT 802', 'available');
    $endedInterment = intermentRecord($this->gasan->id, $endedDecedent, $endedPlot, '2026-06-20', [
        'ended_at' => now(),
        'end_type' => 'exhumed',
        'end_reason' => 'Already ended.',
    ]);
    $voidedInterment = intermentRecord($this->gasan->id, $voidedDecedent, $voidedPlot, '2026-06-21', [
        'voided_at' => now(),
        'void_reason' => 'Already voided.',
    ]);

    $boacSite = intermentSite($this->boac->id, 'BOAC CEMETERY');
    $boacBlock = intermentBlock($this->boac->id, intermentSection($this->boac->id, $boacSite, 'SECTION A'), 'GENERAL');
    $boacDecedent = intermentReadyDecedent($this->boac->id, 'BOAC', 'PEDRO');
    $boacPlot = intermentPlot($this->boac->id, $boacSite, $boacBlock, 'BOAC LOT 1', 'occupied');
    $crossTenantInterment = intermentRecord($this->boac->id, $boacDecedent, $boacPlot, '2026-06-22');

    $this->patch(route('interments.void', ['interment_id' => $endedInterment]), [
        'reason' => 'Attempt to void ended row.',
    ])->assertSessionHasErrors('interment');

    session()->flush();

    $this->patch(route('interments.void', ['interment_id' => $voidedInterment]), [
        'reason' => 'Attempt to void already voided row.',
    ])->assertSessionHasErrors('interment');

    session()->flush();

    $this->patch(route('interments.void', ['interment_id' => $crossTenantInterment]), [
        'reason' => 'Cross tenant attempt.',
    ])->assertNotFound();
});

it('includes the full plot hierarchy and profile link in the Decedent profile payload', function () {
    $site = intermentSite($this->gasan->id, 'GASAN CENTRAL');
    $section = intermentSection($this->gasan->id, $site, 'NEW ANNEX');
    $block = intermentBlock($this->gasan->id, $section, 'GENERAL');
    $decedentId = intermentReadyDecedent($this->gasan->id, 'SANTOS', 'JUAN');
    $plot = intermentPlot($this->gasan->id, $site, $block, 'LOT 737', 'occupied');

    intermentRecord($this->gasan->id, $decedentId, $plot, '2026-06-20');

    $decedent = (new GetDecedentProfileAction)->execute($decedentId, $this->gasan->id);
    $payload = (new DecedentDetailsResource($decedent))->resolve();

    expect($payload['interment']['plot']['slot_label'])->toBe('LOT 737')
        ->and($payload['interment']['plot']['cemetery_site']['id'])->toBe($site)
        ->and($payload['interment']['plot']['cemetery_site']['name'])->toBe('GASAN CENTRAL')
        ->and($payload['interment']['plot']['section']['id'])->toBe($section)
        ->and($payload['interment']['plot']['section']['name'])->toBe('NEW ANNEX')
        ->and($payload['interment']['plot']['block']['id'])->toBe($block)
        ->and($payload['interment']['plot']['block']['name'])->toBe('GENERAL')
        ->and($payload['interment']['plot']['profile_url'])->toBe(route('cemetery.admin.sites.plots.profile.page', [
            'municipality' => $this->gasan->slug,
            'cemetery_site_id' => $site,
            'plot_id' => $plot,
        ]));
});

it('returns a Decedent cemetery history timeline with active ended and voided rows', function () {
    $site = intermentSite($this->gasan->id, 'GASAN CENTRAL');
    $section = intermentSection($this->gasan->id, $site, 'NEW ANNEX');
    $block = intermentBlock($this->gasan->id, $section, 'GENERAL');
    $decedentId = intermentReadyDecedent($this->gasan->id, 'SANTOS', 'JUAN');
    $originalPlot = intermentPlot($this->gasan->id, $site, $block, 'LOT 737', 'available');
    $currentPlot = intermentPlot($this->gasan->id, $site, $block, 'LOT 738', 'available');
    $mistakenPlot = intermentPlot($this->gasan->id, $site, $block, 'LOT 739', 'available');

    $originalInterment = intermentRecord($this->gasan->id, $decedentId, $originalPlot, '2026-06-01');
    DB::table('cemetery_interments')->where('id', $originalInterment)->update([
        'ended_at' => now(),
        'end_reason' => 'Family requested relocation.',
        'end_notes' => 'Moved after caretaker confirmation.',
    ]);

    DB::table('cemetery_interments')->insert([
        'id' => $currentInterment = (string) Str::ulid(),
        'municipal_id' => $this->gasan->id,
        'decedent_id' => $decedentId,
        'plot_id' => $currentPlot,
        'previous_interment_id' => $originalInterment,
        'interment_date' => '2026-06-15',
        'type' => 'transfer',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    DB::table('cemetery_interments')->insert([
        'id' => (string) Str::ulid(),
        'municipal_id' => $this->gasan->id,
        'decedent_id' => $decedentId,
        'plot_id' => $mistakenPlot,
        'previous_interment_id' => $currentInterment,
        'interment_date' => '2026-06-20',
        'type' => 'transfer',
        'voided_at' => now(),
        'void_reason' => 'Wrong destination plot selected.',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $decedent = (new GetDecedentProfileAction)->execute($decedentId, $this->gasan->id);
    $payload = (new DecedentDetailsResource($decedent))->resolve();

    expect($payload['interment_history'])->toHaveCount(3)
        ->and($payload['interment_history'][0]['lifecycle_status'])->toBe('active')
        ->and($payload['interment_history'][0]['plot']['slot_label'])->toBe('LOT 738')
        ->and($payload['interment_history'][0]['plot']['section']['name'])->toBe('NEW ANNEX')
        ->and($payload['interment_history'][1]['lifecycle_status'])->toBe('voided')
        ->and($payload['interment_history'][1]['plot']['slot_label'])->toBe('LOT 739')
        ->and($payload['interment_history'][1]['void_reason'])->toBe('Wrong destination plot selected.')
        ->and($payload['interment_history'][2]['lifecycle_status'])->toBe('ended')
        ->and($payload['interment_history'][2]['plot']['slot_label'])->toBe('LOT 737')
        ->and($payload['interment_history'][2]['destination_plot_label'])->toBe('LOT 738')
        ->and($payload['interment_history'][2]['end_reason'])->toBe('Family requested relocation.');
});

it('allows shared plots to receive interments until capacity is reached', function () {
    $site = intermentSite($this->gasan->id, 'GASAN CENTRAL');
    $block = intermentBlock($this->gasan->id, intermentSection($this->gasan->id, $site, 'NEW ANNEX'), 'GENERAL');
    $firstDecedent = intermentReadyDecedent($this->gasan->id, 'SANTOS', 'ANA');
    $secondDecedent = intermentReadyDecedent($this->gasan->id, 'SANTOS', 'BEN');
    $thirdDecedent = intermentReadyDecedent($this->gasan->id, 'SANTOS', 'CARLO');
    $plot = intermentPlot($this->gasan->id, $site, $block, 'LOT 800', 'available', 'shared', 2);

    $this->post(route('interments.store'), intermentPayload($site, $firstDecedent, $plot))->assertRedirect();

    $this->post(route('interments.store'), intermentPayload($site, $secondDecedent, $plot))->assertRedirect();

    $this->post(route('interments.store'), intermentPayload($site, $thirdDecedent, $plot))->assertSessionHasErrors('plot_id');

    expect(DB::table('cemetery_interments')->where('plot_id', $plot)->count())->toBe(2)
        ->and(DB::table('cemetery_plot_leases')->where('plot_id', $plot)->count())->toBe(0)
        ->and(DB::table('cemetery_plots')->where('id', $plot)->value('status'))->toBe('occupied');
});

it('rejects a second active interment for single plots', function () {
    $site = intermentSite($this->gasan->id, 'GASAN CENTRAL');
    $block = intermentBlock($this->gasan->id, intermentSection($this->gasan->id, $site, 'NEW ANNEX'), 'GENERAL');
    $firstDecedent = intermentReadyDecedent($this->gasan->id, 'REYES', 'ANA');
    $secondDecedent = intermentReadyDecedent($this->gasan->id, 'REYES', 'BEN');
    $plot = intermentPlot($this->gasan->id, $site, $block, 'LOT 801', 'available');

    $this->post(route('interments.store'), intermentPayload($site, $firstDecedent, $plot))->assertRedirect();

    $this->post(route('interments.store'), intermentPayload($site, $secondDecedent, $plot))->assertSessionHasErrors('plot_id');

    expect(DB::table('cemetery_interments')->where('plot_id', $plot)->count())->toBe(1);
});

it('rejects direct interment into slotted apartment parent rows', function () {
    $site = intermentSite($this->gasan->id, 'GASAN CENTRAL');
    $block = intermentBlock($this->gasan->id, intermentSection($this->gasan->id, $site, 'APARTMENT AREA'), 'BUILDING A');
    $decedent = intermentReadyDecedent($this->gasan->id, 'CRUZ', 'MARIA');
    $parentPlot = intermentPlot($this->gasan->id, $site, $block, 'APARTMENT A', null, 'slotted', 10, 'apartment_niche');

    $this->post(route('interments.store'), intermentPayload($site, $decedent, $parentPlot))->assertSessionHasErrors('plot_id');

    expect(DB::table('cemetery_interments')->where('plot_id', $parentPlot)->count())->toBe(0);
});

it('rejects leaseholder fields on interment creation', function () {
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
        'requesting_party_name' => 'JUAN DELA CRUZ',
        'requesting_party_relationship' => 'REPRESENTATIVE',
        'leaseholder_name' => 'Juan Dela Cruz',
        'amount_paid' => '500.00',
    ])->assertSessionHasErrors(['leaseholder_name', 'amount_paid']);

    expect(DB::table('cemetery_interments')->count())->toBe(0)
        ->and(DB::table('cemetery_plot_leases')->count())->toBe(0)
        ->and(DB::table('cemetery_plots')->where('id', $plot)->value('status'))->toBe('available');
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
        'requesting_party_name' => 'MARIA SANTOS',
        'requesting_party_relationship' => 'CHILD',
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

function intermentRecord(string $municipalId, string $decedentId, string $plotId, string $date, array $overrides = []): string
{
    DB::table('cemetery_interments')->insert(array_merge([
        'id' => $id = (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'decedent_id' => $decedentId,
        'plot_id' => $plotId,
        'interment_date' => $date,
        'type' => 'initial',
        'created_at' => now(),
        'updated_at' => now(),
    ], $overrides));

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
        'requesting_party_name' => 'MARIA SANTOS',
        'requesting_party_relationship' => 'CHILD',
    ], $overrides);
}

function movePayload(string $siteId, string $destinationPlotId, array $overrides = []): array
{
    return array_merge([
        'destination_cemetery_site_id' => $siteId,
        'destination_plot_id' => $destinationPlotId,
        'movement_date' => '2026-06-25',
        'reason' => 'Family requested relocation.',
        'requesting_party_name' => 'MARIA SANTOS',
        'requesting_party_relationship' => 'CHILD',
    ], $overrides);
}

function closePayload(array $overrides = []): array
{
    return array_merge([
        'end_type' => 'exhumed',
        'ended_date' => '2026-06-30',
        'reason' => 'Family requested closure.',
        'requesting_party_name' => 'MARIA SANTOS',
        'requesting_party_relationship' => 'CHILD',
    ], $overrides);
}

function intermentLease(string $municipalId, string $plotId, string $leaseholderName): string
{
    DB::table('cemetery_plot_leases')->insert([
        'id' => $id = (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'plot_id' => $plotId,
        'leaseholder_name' => $leaseholderName,
        'leaseholder_contact' => '09994587692',
        'leaseholder_relationship' => 'CHILD',
        'status' => 'active',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return $id;
}

function intermentStaffUser(): User
{
    $id = (string) Str::ulid();

    DB::table('users')->insert([
        'id' => $id,
        'full_name' => 'Cemetery Admin',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return User::query()->findOrFail($id);
}
