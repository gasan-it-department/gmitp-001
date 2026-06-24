<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

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
