<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

afterEach(function () {
    Schema::dropIfExists('ac_document_types');
    Schema::dropIfExists('municipalities');
});

it('keeps existing documents global and supports municipality-owned documents', function () {
    Schema::create('municipalities', function (Blueprint $table) {
        $table->ulid('id')->primary();
    });

    Schema::create('ac_document_types', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->string('key')->unique();
        $table->string('label');
        $table->timestamps();
    });

    $globalDocumentId = (string) Str::ulid();
    DB::table('ac_document_types')->insert([
        'id' => $globalDocumentId,
        'key' => 'global_document',
        'label' => 'Global Document',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $migration = require database_path(
        'migrations/2026_07_22_000002_add_municipal_id_to_ac_document_types.php',
    );

    $migration->up();

    $municipalId = (string) Str::ulid();
    DB::table('municipalities')->insert(['id' => $municipalId]);
    DB::table('ac_document_types')->insert([
        'id' => (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'key' => 'custom_document',
        'label' => 'Custom Document',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    expect(Schema::hasColumn('ac_document_types', 'municipal_id'))->toBeTrue()
        ->and(DB::table('ac_document_types')->where('id', $globalDocumentId)->value('municipal_id'))->toBeNull()
        ->and(DB::table('ac_document_types')->where('key', 'custom_document')->value('municipal_id'))
        ->toBe($municipalId);

    $migration->down();

    expect(Schema::hasColumn('ac_document_types', 'municipal_id'))->toBeFalse();
});
