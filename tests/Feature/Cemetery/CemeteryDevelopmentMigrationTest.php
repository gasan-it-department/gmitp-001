<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

it('creates the simplified document and governance schema from a fresh database', function () {
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
    $governanceMigration = require database_path('migrations/2026_06_15_000004_create_cemetery_decedent_governance_tables.php');

    try {
        $documentsMigration->up();
        $governanceMigration->up();

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
        $governanceMigration->down();
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

    $migration = require database_path('migrations/2026_06_14_000006_create_cemetery_unidentified_details_table.php');

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
