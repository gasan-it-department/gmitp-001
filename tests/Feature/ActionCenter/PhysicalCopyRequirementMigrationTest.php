<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

afterEach(function () {
    Schema::dropIfExists('ac_assistance_type_documents');
});

it('adds the physical copy requirement with a safe default and rolls it back', function () {
    Schema::create('ac_assistance_type_documents', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('assistance_type_id');
        $table->ulid('document_type_id');
        $table->boolean('is_required')->default(true);
        $table->unsignedInteger('sort_order')->default(0);
        $table->timestamps();
    });

    $migration = require database_path(
        'migrations/2026_07_22_000001_add_physical_copy_requirement_to_ac_assistance_type_documents.php',
    );

    $migration->up();

    $id = (string) Str::ulid();
    DB::table('ac_assistance_type_documents')->insert([
        'id' => $id,
        'assistance_type_id' => (string) Str::ulid(),
        'document_type_id' => (string) Str::ulid(),
        'is_required' => true,
        'sort_order' => 10,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    expect(Schema::hasColumn('ac_assistance_type_documents', 'physical_copy_requirement'))->toBeTrue()
        ->and(DB::table('ac_assistance_type_documents')->where('id', $id)->value('physical_copy_requirement'))
        ->toBe('unspecified');

    $migration->down();

    expect(Schema::hasColumn('ac_assistance_type_documents', 'physical_copy_requirement'))->toBeFalse();
});
