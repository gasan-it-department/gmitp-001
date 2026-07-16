<?php

use App\Core\Cemetery\Actions\Decedents\GetIntermentReadinessAction;
use App\Core\Cemetery\Actions\Reports\ListIntermentLifecycleReportAction;
use App\Core\Cemetery\Actions\Reports\ListLeaseExpiryReportAction;
use App\Core\Cemetery\Actions\Reports\ListMissingDocumentsReportAction;
use App\Core\Cemetery\Actions\Reports\ListPlotInventoryReportAction;
use App\Core\Cemetery\Dto\Reports\IntermentLifecycleReportFiltersDto;
use App\Core\Cemetery\Dto\Reports\LeaseReportFiltersDto;
use App\Core\Cemetery\Dto\Reports\MissingDocumentsReportFiltersDto;
use App\Core\Cemetery\Dto\Reports\PlotInventoryReportFiltersDto;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

beforeEach(function () {
    Schema::create('cemetery_sites', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->string('name');
        $table->string('status')->default('active');
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('cemetery_sections', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->ulid('cemetery_site_id');
        $table->string('name');
        $table->string('status')->default('active');
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('cemetery_blocks', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->ulid('section_id');
        $table->string('name');
        $table->string('status')->default('active');
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('cemetery_plots', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->ulid('cemetery_site_id');
        $table->ulid('block_id');
        $table->ulid('parent_plot_id')->nullable();
        $table->string('name');
        $table->string('type');
        $table->string('status')->nullable();
        $table->string('occupancy_mode')->default('single');
        $table->string('row')->nullable();
        $table->unsignedInteger('level')->nullable();
        $table->string('position')->nullable();
        $table->unsignedInteger('capacity')->default(1);
        $table->decimal('area_sqm', 8, 2)->nullable();
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('cemetery_decedents', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->string('first_name')->nullable();
        $table->string('last_name')->nullable();
        $table->string('suffix')->nullable();
        $table->string('memorial_name')->nullable();
        $table->string('identity_status')->default('identified');
        $table->boolean('has_legal_name')->default(true);
        $table->string('vital_record_type')->default('death');
        $table->string('registration_status')->default('verified');
        $table->string('registry_number')->nullable();
        $table->date('date_of_death')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('cemetery_decedent_documents', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->ulid('decedent_id');
        $table->string('type');
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('cemetery_unidentified_details', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->ulid('decedent_id');
        $table->string('case_reference');
        $table->boolean('requires_medico_legal')->default(false);
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('cemetery_interments', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->ulid('decedent_id');
        $table->ulid('plot_id');
        $table->ulid('previous_interment_id')->nullable();
        $table->date('interment_date')->nullable();
        $table->string('type')->default('initial');
        $table->text('notes')->nullable();
        $table->timestamp('ended_at')->nullable();
        $table->ulid('ended_by')->nullable();
        $table->string('end_type')->nullable();
        $table->string('end_reason')->nullable();
        $table->text('end_notes')->nullable();
        $table->string('transfer_destination')->nullable();
        $table->string('permit_reference')->nullable();
        $table->timestamp('voided_at')->nullable();
        $table->ulid('voided_by')->nullable();
        $table->string('void_reason')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('cemetery_plot_leases', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->ulid('created_from_interment_id')->nullable();
        $table->ulid('plot_id');
        $table->string('leaseholder_name');
        $table->string('leaseholder_contact')->nullable();
        $table->string('leaseholder_address')->nullable();
        $table->string('leaseholder_relationship')->nullable();
        $table->date('lease_start')->nullable();
        $table->date('lease_end')->nullable();
        $table->decimal('amount_paid', 10, 2)->nullable();
        $table->string('or_number')->nullable();
        $table->string('status')->default('active');
        $table->text('notes')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('cemetery_interment_readiness_overrides', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->ulid('decedent_id');
        $table->json('missing_requirements');
        $table->string('reason');
        $table->string('evidence_reference');
        $table->timestamp('consumed_at')->nullable();
        $table->timestamps();
    });

    $this->gasan = (string) Str::ulid();
    $this->boac = (string) Str::ulid();
    $this->gasanBlock = reportBlock($this->gasan, 'GASAN CENTRAL', 'SECTION A', 'BLOCK 1');
    $this->boacBlock = reportBlock($this->boac, 'BOAC CENTRAL', 'SECTION B', 'BLOCK 2');
});

afterEach(function () {
    Schema::dropIfExists('cemetery_interment_readiness_overrides');
    Schema::dropIfExists('cemetery_plot_leases');
    Schema::dropIfExists('cemetery_interments');
    Schema::dropIfExists('cemetery_unidentified_details');
    Schema::dropIfExists('cemetery_decedent_documents');
    Schema::dropIfExists('cemetery_decedents');
    Schema::dropIfExists('cemetery_plots');
    Schema::dropIfExists('cemetery_blocks');
    Schema::dropIfExists('cemetery_sections');
    Schema::dropIfExists('cemetery_sites');
});

it('reports lease expiry rows and occupied plots without active leases within one tenant', function () {
    $expiredPlot = reportPlot($this->gasan, $this->gasanBlock, 'LOT 1', 'occupied');
    $noLeasePlot = reportPlot($this->gasan, $this->gasanBlock, 'LOT 2', 'occupied');
    $activePlot = reportPlot($this->gasan, $this->gasanBlock, 'LOT 4', 'available');
    $boacPlot = reportPlot($this->boac, $this->boacBlock, 'LOT 3', 'occupied');
    $decedent = reportDecedent($this->gasan, 'GOKU', 'SON');

    reportLease($this->gasan, $expiredPlot, now()->subDays(5)->toDateString(), 'EXPIRED HOLDER');
    reportLease($this->gasan, $activePlot, now()->addYear()->toDateString(), 'ACTIVE HOLDER');
    reportLease($this->boac, $boacPlot, now()->subDays(5)->toDateString(), 'BOAC HOLDER');
    reportInterment($this->gasan, $decedent, $noLeasePlot);

    $action = new ListLeaseExpiryReportAction;
    $defaultRows = $action->rowsForExport($this->gasan, LeaseReportFiltersDto::fromArray([]));
    $allRows = $action->rowsForExport($this->gasan, LeaseReportFiltersDto::fromArray(['lease_state' => 'all']));
    $expiredRows = $action->rowsForExport($this->gasan, LeaseReportFiltersDto::fromArray(['lease_state' => 'expired']));
    $activeRows = $action->rowsForExport($this->gasan, LeaseReportFiltersDto::fromArray(['lease_state' => 'active']));
    $noLeaseRows = $action->rowsForExport($this->gasan, LeaseReportFiltersDto::fromArray(['lease_state' => 'no_active_lease']));

    expect($defaultRows)->toHaveCount(3)
        ->and($allRows)->toHaveCount(3)
        ->and($expiredRows)->toHaveCount(1)
        ->and($expiredRows[0]['leaseholder_name'])->toBe('EXPIRED HOLDER')
        ->and($activeRows)->toHaveCount(1)
        ->and($activeRows[0]['leaseholder_name'])->toBe('ACTIVE HOLDER')
        ->and($noLeaseRows)->toHaveCount(1)
        ->and($noLeaseRows[0]['plot_label'])->toBe('LOT 2');
});

it('reports assignable plots separately from apartment containers', function () {
    reportPlot($this->gasan, $this->gasanBlock, 'LOT 1', 'available', occupancyMode: 'single', capacity: 1, area: 6);
    $parent = reportPlot($this->gasan, $this->gasanBlock, 'APARTMENT A', null, occupancyMode: 'slotted', capacity: 10);
    reportPlot($this->gasan, $this->gasanBlock, 'APARTMENT A', 'available', parentPlotId: $parent, occupancyMode: 'shared', capacity: 5, level: 1, row: 'R1', position: 'N01');
    reportPlot($this->boac, $this->boacBlock, 'LOT 9', 'available');

    $action = new ListPlotInventoryReportAction;
    $assignable = $action->rowsForExport($this->gasan, PlotInventoryReportFiltersDto::fromArray(['scope' => 'assignable']));
    $containers = $action->rowsForExport($this->gasan, PlotInventoryReportFiltersDto::fromArray(['scope' => 'containers']));

    expect($assignable)->toHaveCount(2)
        ->and(collect($assignable)->pluck('plot_label')->all())->toContain('LOT 1', 'APARTMENT A-F1-R1-N01')
        ->and($containers)->toHaveCount(1)
        ->and($containers[0]['plot_label'])->toBe('APARTMENT A');
});

it('reports missing documents for verified decedents and excludes complete or cross-tenant records', function () {
    $missing = reportDecedent($this->gasan, 'GOKU', 'SON', registry: 'REG-1');
    $complete = reportDecedent($this->gasan, 'VEGETA', 'PRINCE', registry: 'REG-2');
    $boac = reportDecedent($this->boac, 'PICCOLO', 'NAMEK', registry: 'REG-3');

    reportDocument($this->gasan, $missing, 'death_certificate');
    reportDocument($this->gasan, $complete, 'death_certificate');
    reportDocument($this->gasan, $complete, 'burial_permit');
    reportDocument($this->boac, $boac, 'death_certificate');

    DB::table('cemetery_interment_readiness_overrides')->insert([
        'id' => (string) Str::ulid(),
        'municipal_id' => $this->gasan,
        'decedent_id' => $missing,
        'missing_requirements' => json_encode(['burial_permit']),
        'reason' => 'OLD RECORD',
        'evidence_reference' => 'LOGBOOK 12',
        'consumed_at' => now(),
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $rows = (new ListMissingDocumentsReportAction(new GetIntermentReadinessAction))
        ->rowsForExport($this->gasan, MissingDocumentsReportFiltersDto::fromArray([]));

    expect($rows)->toHaveCount(1)
        ->and($rows[0]['registry_number'])->toBe('REG-1')
        ->and($rows[0]['missing_document_types'])->toBe(['burial_permit'])
        ->and($rows[0]['pending_document_reason'])->toBe('OLD RECORD');
});

it('reports interment lifecycle states with tenant and lifecycle filters', function () {
    $plot = reportPlot($this->gasan, $this->gasanBlock, 'LOT 1', 'occupied');
    $boacPlot = reportPlot($this->boac, $this->boacBlock, 'LOT 2', 'occupied');
    $decedent = reportDecedent($this->gasan, 'GOKU', 'SON');
    $boacDecedent = reportDecedent($this->boac, 'PICCOLO', 'NAMEK');

    reportInterment($this->gasan, $decedent, $plot);
    reportInterment($this->gasan, $decedent, $plot, endType: 'transferred_out', endedAt: now(), destination: 'MANILA NORTH CEMETERY');
    reportInterment($this->gasan, $decedent, $plot, voidedAt: now(), voidReason: 'WRONG DECEDENT');
    reportInterment($this->boac, $boacDecedent, $boacPlot, endType: 'exhumed', endedAt: now());

    $action = new ListIntermentLifecycleReportAction;
    $allRows = $action->rowsForExport($this->gasan, IntermentLifecycleReportFiltersDto::fromArray([]));
    $transferredRows = $action->rowsForExport($this->gasan, IntermentLifecycleReportFiltersDto::fromArray(['lifecycle_status' => 'transferred_out']));
    $voidedRows = $action->rowsForExport($this->gasan, IntermentLifecycleReportFiltersDto::fromArray(['lifecycle_status' => 'voided']));

    expect($allRows)->toHaveCount(3)
        ->and($transferredRows)->toHaveCount(1)
        ->and($transferredRows[0]['transfer_destination'])->toBe('MANILA NORTH CEMETERY')
        ->and($voidedRows)->toHaveCount(1)
        ->and($voidedRows[0]['reason'])->toBe('WRONG DECEDENT');
});

function reportBlock(string $municipalId, string $siteName, string $sectionName, string $blockName): string
{
    $siteId = (string) Str::ulid();
    $sectionId = (string) Str::ulid();
    $blockId = (string) Str::ulid();

    DB::table('cemetery_sites')->insert([
        'id' => $siteId,
        'municipal_id' => $municipalId,
        'name' => $siteName,
        'status' => 'active',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    DB::table('cemetery_sections')->insert([
        'id' => $sectionId,
        'municipal_id' => $municipalId,
        'cemetery_site_id' => $siteId,
        'name' => $sectionName,
        'status' => 'active',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    DB::table('cemetery_blocks')->insert([
        'id' => $blockId,
        'municipal_id' => $municipalId,
        'section_id' => $sectionId,
        'name' => $blockName,
        'status' => 'active',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return $blockId;
}

function reportPlot(
    string $municipalId,
    string $blockId,
    string $name,
    ?string $status,
    ?string $parentPlotId = null,
    string $occupancyMode = 'single',
    int $capacity = 1,
    ?int $level = null,
    ?string $row = null,
    ?string $position = null,
    ?int $area = null,
): string {
    $sectionId = DB::table('cemetery_blocks')->where('id', $blockId)->value('section_id');
    $siteId = DB::table('cemetery_sections')->where('id', $sectionId)->value('cemetery_site_id');
    $plotId = (string) Str::ulid();

    DB::table('cemetery_plots')->insert([
        'id' => $plotId,
        'municipal_id' => $municipalId,
        'cemetery_site_id' => $siteId,
        'block_id' => $blockId,
        'parent_plot_id' => $parentPlotId,
        'name' => $name,
        'type' => $occupancyMode === 'slotted' || $parentPlotId ? 'apartment_niche' : 'lawn_lot',
        'status' => $status,
        'occupancy_mode' => $occupancyMode,
        'row' => $row,
        'level' => $level,
        'position' => $position,
        'capacity' => $capacity,
        'area_sqm' => $area,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return $plotId;
}

function reportDecedent(string $municipalId, string $firstName, string $lastName, ?string $registry = null): string
{
    $id = (string) Str::ulid();

    DB::table('cemetery_decedents')->insert([
        'id' => $id,
        'municipal_id' => $municipalId,
        'first_name' => $firstName,
        'last_name' => $lastName,
        'identity_status' => 'identified',
        'has_legal_name' => true,
        'vital_record_type' => 'death',
        'registration_status' => 'verified',
        'registry_number' => $registry,
        'date_of_death' => '2026-01-01',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return $id;
}

function reportDocument(string $municipalId, string $decedentId, string $type): void
{
    DB::table('cemetery_decedent_documents')->insert([
        'id' => (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'decedent_id' => $decedentId,
        'type' => $type,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
}

function reportLease(string $municipalId, string $plotId, string $leaseEnd, string $holder): void
{
    DB::table('cemetery_plot_leases')->insert([
        'id' => (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'plot_id' => $plotId,
        'leaseholder_name' => $holder,
        'lease_start' => now()->subYears(5)->toDateString(),
        'lease_end' => $leaseEnd,
        'amount_paid' => 500,
        'or_number' => 'OR-'.$holder,
        'status' => 'active',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
}

function reportInterment(
    string $municipalId,
    string $decedentId,
    string $plotId,
    ?string $endType = null,
    mixed $endedAt = null,
    ?string $destination = null,
    mixed $voidedAt = null,
    ?string $voidReason = null,
): void {
    DB::table('cemetery_interments')->insert([
        'id' => (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'decedent_id' => $decedentId,
        'plot_id' => $plotId,
        'interment_date' => '2026-01-15',
        'type' => $endType ? 'transfer' : 'initial',
        'ended_at' => $endedAt,
        'end_type' => $endType,
        'end_reason' => $endType ? 'FAMILY REQUEST' : null,
        'transfer_destination' => $destination,
        'voided_at' => $voidedAt,
        'void_reason' => $voidReason,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
}
