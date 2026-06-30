<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

it('creates decedents with flattened address fields only', function () {
    Schema::create('municipalities', function (Blueprint $table) {
        $table->ulid('id')->primary();
    });
    Schema::create('psgc_municipalities', function (Blueprint $table) {
        $table->id();
    });

    $migration = require database_path('migrations/2026_06_14_000001_create_cemetery_decedents_table.php');

    try {
        $migration->up();

        expect(Schema::hasColumn('cemetery_decedents', 'address_id'))->toBeFalse()
            ->and(Schema::hasColumn('cemetery_decedents', 'psgc_municipality_id'))->toBeTrue()
            ->and(Schema::hasColumn('cemetery_decedents', 'psgc_barangay_code'))->toBeTrue()
            ->and(Schema::hasColumn('cemetery_decedents', 'street_name'))->toBeTrue();
    } finally {
        $migration->down();
        Schema::dropIfExists('psgc_municipalities');
        Schema::dropIfExists('municipalities');
    }
});

it('creates the simplified document and readiness override schema from a fresh database', function () {
    Schema::create('municipalities', function (Blueprint $table) {
        $table->ulid('id')->primary();
    });
    Schema::create('users', function (Blueprint $table) {
        $table->ulid('id')->primary();
    });
    Schema::create('cemetery_decedents', function (Blueprint $table) {
        $table->ulid('id')->primary();
    });

    $documentsMigration = require database_path('migrations/2026_06_15_000002_create_cemetery_decedent_documents_table.php');
    $readinessMigration = require database_path('migrations/2026_06_15_000003_create_cemetery_interment_readiness_overrides_table.php');

    try {
        $documentsMigration->up();
        $readinessMigration->up();

        expect(Schema::hasTable('cemetery_decedent_documents'))->toBeTrue()
            ->and(Schema::hasColumn('cemetery_decedent_documents', 'type'))->toBeTrue()
            ->and(Schema::hasColumn('cemetery_decedent_documents', 'document_number'))->toBeTrue()
            ->and(Schema::hasColumn('cemetery_decedent_documents', 'supersedes_id'))->toBeFalse()
            ->and(Schema::hasColumn('cemetery_decedent_documents', 'verification_status'))->toBeFalse()
            ->and(Schema::hasColumn('cemetery_decedent_documents', 'verified_at'))->toBeFalse()
            ->and(Schema::hasColumn('cemetery_decedent_documents', 'verified_by'))->toBeFalse()
            ->and(Schema::hasColumn('cemetery_decedent_documents', 'verification_notes'))->toBeFalse()
            ->and(Schema::hasTable('cemetery_decedent_corrections'))->toBeFalse()
            ->and(Schema::hasTable('cemetery_interment_readiness_overrides'))->toBeTrue();
    } finally {
        $readinessMigration->down();
        $documentsMigration->down();
        Schema::dropIfExists('cemetery_decedents');
        Schema::dropIfExists('users');
        Schema::dropIfExists('municipalities');
    }
});

it('creates final unidentified details without a fetal subtype table', function () {
    Schema::create('municipalities', function (Blueprint $table) {
        $table->ulid('id')->primary();
    });
    Schema::create('cemetery_decedents', function (Blueprint $table) {
        $table->ulid('id')->primary();
    });

    $migration = require database_path('migrations/2026_06_14_000007_create_cemetery_unidentified_details_table.php');

    try {
        $migration->up();

        expect(Schema::hasTable('cemetery_unidentified_details'))->toBeTrue()
            ->and(Schema::hasColumn('cemetery_unidentified_details', 'municipal_id'))->toBeTrue()
            ->and(Schema::hasColumn('cemetery_unidentified_details', 'case_reference'))->toBeTrue()
            ->and(Schema::hasColumn('cemetery_unidentified_details', 'reference_code'))->toBeFalse()
            ->and(Schema::hasColumn('cemetery_unidentified_details', 'requires_medico_legal'))->toBeTrue()
            ->and(Schema::hasColumn('cemetery_unidentified_details', 'deleted_at'))->toBeTrue()
            ->and(Schema::hasTable('cemetery_fetal_death_details'))->toBeFalse();
    } finally {
        $migration->down();
        Schema::dropIfExists('cemetery_decedents');
        Schema::dropIfExists('municipalities');
    }
});

it('creates operational plot leases instead of plot deeds', function () {
    Schema::create('municipalities', function (Blueprint $table) {
        $table->ulid('id')->primary();
    });
    Schema::create('cemetery_decedents', function (Blueprint $table) {
        $table->ulid('id')->primary();
    });

    $migrations = [
        require database_path('migrations/2026_06_14_000002_create_cemetery_sites_table.php'),
        require database_path('migrations/2026_06_14_000003_create_cemetery_sections_table.php'),
        require database_path('migrations/2026_06_14_000004_create_cemetery_blocks_table.php'),
        require database_path('migrations/2026_06_14_000005_create_cemetery_plots_table.php'),
        require database_path('migrations/2026_06_14_000008_create_cemetery_plot_deeds_table.php'),
        require database_path('migrations/2026_06_14_000009_create_cemetery_interments_table.php'),
    ];

    try {
        foreach ($migrations as $migration) {
            $migration->up();
        }

        $municipalId = (string) Str::ulid();
        $siteId = (string) Str::ulid();
        $sectionId = (string) Str::ulid();
        $blockId = (string) Str::ulid();
        $plotId = (string) Str::ulid();
        $decedentId = (string) Str::ulid();
        $intermentId = (string) Str::ulid();
        $leaseId = (string) Str::ulid();

        DB::table('municipalities')->insert(['id' => $municipalId]);
        DB::table('cemetery_decedents')->insert(['id' => $decedentId]);
        DB::table('cemetery_sites')->insert([
            'id' => $siteId,
            'municipal_id' => $municipalId,
            'name' => 'GASAN CENTRAL',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('cemetery_sections')->insert([
            'id' => $sectionId,
            'municipal_id' => $municipalId,
            'cemetery_site_id' => $siteId,
            'name' => 'SECTION A',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('cemetery_blocks')->insert([
            'id' => $blockId,
            'municipal_id' => $municipalId,
            'section_id' => $sectionId,
            'name' => 'BLOCK 1',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('cemetery_plots')->insert([
            'id' => $plotId,
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
        DB::table('cemetery_interments')->insert([
            'id' => $intermentId,
            'municipal_id' => $municipalId,
            'decedent_id' => $decedentId,
            'plot_id' => $plotId,
            'type' => 'initial',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('cemetery_plot_leases')->insert([
            'id' => $leaseId,
            'municipal_id' => $municipalId,
            'interment_id' => $intermentId,
            'plot_id' => $plotId,
            'leaseholder_name' => 'JUAN DELA CRUZ',
            'lease_start' => '2026-01-01',
            'lease_end' => '2031-01-01',
            'or_number' => 'OR-1001',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $interment = \App\Core\Cemetery\Models\Interment::query()
            ->with('lease')
            ->findOrFail($intermentId);
        $lease = \App\Core\Cemetery\Models\PlotLease::query()
            ->with(['interment', 'plot'])
            ->findOrFail($leaseId);

        expect(Schema::hasTable('cemetery_plot_deeds'))->toBeFalse()
            ->and(Schema::hasTable('cemetery_plot_leases'))->toBeTrue()
            ->and(Schema::hasColumn('cemetery_plot_leases', 'municipal_id'))->toBeTrue()
            ->and(Schema::hasColumn('cemetery_plot_leases', 'interment_id'))->toBeTrue()
            ->and(Schema::hasColumn('cemetery_plot_leases', 'plot_id'))->toBeTrue()
            ->and(Schema::hasColumn('cemetery_plot_leases', 'leaseholder_name'))->toBeTrue()
            ->and(Schema::hasColumn('cemetery_plot_leases', 'owner_name'))->toBeFalse()
            ->and(Schema::hasColumn('cemetery_plot_leases', 'deleted_at'))->toBeTrue()
            ->and(DB::table('cemetery_interments')->where('id', $intermentId)->value('id'))->toBe($intermentId)
            ->and(DB::table('cemetery_plot_leases')->where('id', $leaseId)->value('plot_id'))->toBe($plotId)
            ->and($interment->lease?->id)->toBe($leaseId)
            ->and($lease->interment?->id)->toBe($intermentId)
            ->and($lease->plot?->id)->toBe($plotId);
    } finally {
        foreach (array_reverse($migrations) as $migration) {
            $migration->down();
        }

        Schema::dropIfExists('cemetery_decedents');
        Schema::dropIfExists('municipalities');
    }
});

it('creates cemetery plots with explicit occupancy mode', function () {
    Schema::create('municipalities', function (Blueprint $table) {
        $table->ulid('id')->primary();
    });

    $migrations = [
        require database_path('migrations/2026_06_14_000002_create_cemetery_sites_table.php'),
        require database_path('migrations/2026_06_14_000003_create_cemetery_sections_table.php'),
        require database_path('migrations/2026_06_14_000004_create_cemetery_blocks_table.php'),
        require database_path('migrations/2026_06_14_000005_create_cemetery_plots_table.php'),
    ];

    try {
        foreach ($migrations as $migration) {
            $migration->up();
        }

        expect(Schema::hasColumn('cemetery_plots', 'occupancy_mode'))->toBeTrue();
    } finally {
        foreach (array_reverse($migrations) as $migration) {
            $migration->down();
        }

        Schema::dropIfExists('municipalities');
    }
});

it('creates future-ready plot reservations without wiring reservation behavior', function () {
    Schema::create('municipalities', function (Blueprint $table) {
        $table->ulid('id')->primary();
    });
    Schema::create('users', function (Blueprint $table) {
        $table->ulid('id')->primary();
    });
    Schema::create('cemetery_decedents', function (Blueprint $table) {
        $table->ulid('id')->primary();
    });

    $migrations = [
        require database_path('migrations/2026_06_14_000002_create_cemetery_sites_table.php'),
        require database_path('migrations/2026_06_14_000003_create_cemetery_sections_table.php'),
        require database_path('migrations/2026_06_14_000004_create_cemetery_blocks_table.php'),
        require database_path('migrations/2026_06_14_000005_create_cemetery_plots_table.php'),
        require database_path('migrations/2026_06_14_000009_create_cemetery_interments_table.php'),
        require database_path('migrations/2026_06_14_000010_create_cemetery_plot_reservations_table.php'),
    ];

    try {
        foreach ($migrations as $migration) {
            $migration->up();
        }

        $municipalId = (string) Str::ulid();
        $userId = (string) Str::ulid();
        $siteId = (string) Str::ulid();
        $sectionId = (string) Str::ulid();
        $blockId = (string) Str::ulid();
        $plotId = (string) Str::ulid();
        $decedentId = (string) Str::ulid();
        $intermentId = (string) Str::ulid();
        $reservationId = (string) Str::ulid();
        $unlinkedReservationId = (string) Str::ulid();

        DB::table('municipalities')->insert(['id' => $municipalId]);
        DB::table('users')->insert(['id' => $userId]);
        DB::table('cemetery_decedents')->insert(['id' => $decedentId]);
        DB::table('cemetery_sites')->insert([
            'id' => $siteId,
            'municipal_id' => $municipalId,
            'name' => 'GASAN CENTRAL',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('cemetery_sections')->insert([
            'id' => $sectionId,
            'municipal_id' => $municipalId,
            'cemetery_site_id' => $siteId,
            'name' => 'SECTION A',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('cemetery_blocks')->insert([
            'id' => $blockId,
            'municipal_id' => $municipalId,
            'section_id' => $sectionId,
            'name' => 'BLOCK 1',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('cemetery_plots')->insert([
            'id' => $plotId,
            'municipal_id' => $municipalId,
            'cemetery_site_id' => $siteId,
            'block_id' => $blockId,
            'name' => 'LOT 1',
            'type' => 'lawn_lot',
            'status' => 'reserved',
            'capacity' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('cemetery_interments')->insert([
            'id' => $intermentId,
            'municipal_id' => $municipalId,
            'decedent_id' => $decedentId,
            'plot_id' => $plotId,
            'type' => 'initial',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('cemetery_plot_reservations')->insert([
            'id' => $reservationId,
            'municipal_id' => $municipalId,
            'plot_id' => $plotId,
            'decedent_id' => $decedentId,
            'interment_id' => $intermentId,
            'reserved_for_name' => 'MARIA DELA CRUZ',
            'reserved_for_contact' => '09171234567',
            'reserved_for_address' => 'CABUGAO, GASAN',
            'relationship_to_decedent' => 'SPOUSE',
            'reserved_at' => '2026-06-29 08:00:00',
            'expires_at' => '2026-07-06 08:00:00',
            'status' => 'active',
            'cancelled_by' => $userId,
            'notes' => 'Future reservation schema only.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('cemetery_plot_reservations')->insert([
            'id' => $unlinkedReservationId,
            'municipal_id' => $municipalId,
            'plot_id' => $plotId,
            'reserved_for_name' => 'FAMILY HOLD',
            'reserved_at' => '2026-06-29 09:00:00',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        expect(Schema::hasTable('cemetery_plot_reservations'))->toBeTrue()
            ->and(Schema::hasColumn('cemetery_plot_reservations', 'municipal_id'))->toBeTrue()
            ->and(Schema::hasColumn('cemetery_plot_reservations', 'plot_id'))->toBeTrue()
            ->and(Schema::hasColumn('cemetery_plot_reservations', 'decedent_id'))->toBeTrue()
            ->and(Schema::hasColumn('cemetery_plot_reservations', 'interment_id'))->toBeTrue()
            ->and(Schema::hasColumn('cemetery_plot_reservations', 'cemetery_site_id'))->toBeFalse()
            ->and(Schema::hasColumn('cemetery_plot_reservations', 'reserved_for_name'))->toBeTrue()
            ->and(Schema::hasColumn('cemetery_plot_reservations', 'expires_at'))->toBeTrue()
            ->and(Schema::hasColumn('cemetery_plot_reservations', 'cancelled_by'))->toBeTrue()
            ->and(Schema::hasColumn('cemetery_plot_reservations', 'converted_at'))->toBeTrue()
            ->and(Schema::hasColumn('cemetery_plot_reservations', 'deleted_at'))->toBeTrue()
            ->and(DB::table('cemetery_plot_reservations')->where('id', $reservationId)->value('plot_id'))->toBe($plotId)
            ->and(DB::table('cemetery_plot_reservations')->where('id', $reservationId)->value('decedent_id'))->toBe($decedentId)
            ->and(DB::table('cemetery_plot_reservations')->where('id', $reservationId)->value('interment_id'))->toBe($intermentId)
            ->and(DB::table('cemetery_plot_reservations')->where('id', $unlinkedReservationId)->value('decedent_id'))->toBeNull()
            ->and(DB::table('cemetery_plot_reservations')->where('id', $unlinkedReservationId)->value('interment_id'))->toBeNull()
            ->and(\App\Core\Cemetery\Enums\PlotStatus::RESERVED->value)->toBe('reserved');
    } finally {
        foreach (array_reverse($migrations) as $migration) {
            $migration->down();
        }

        Schema::dropIfExists('cemetery_decedents');
        Schema::dropIfExists('users');
        Schema::dropIfExists('municipalities');
    }
});
