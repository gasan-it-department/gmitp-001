<?php

use App\Core\ActionCenter\Enums\AssistanceGeneratedDocument;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

afterEach(function () {
    Schema::dropIfExists('ac_assistance_types');
});

it('backfills every existing assistance type and rolls the generated documents column back', function () {
    Schema::create('ac_assistance_types', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->unsignedInteger('sort_order')->default(0);
    });

    $assistanceTypeId = (string) Str::ulid();
    DB::table('ac_assistance_types')->insert([
        'id' => $assistanceTypeId,
        'sort_order' => 10,
    ]);

    $migration = require database_path(
        'migrations/2026_09_02_000001_add_enabled_generated_documents_to_ac_assistance_types.php',
    );

    $migration->up();

    $stored = DB::table('ac_assistance_types')
        ->where('id', $assistanceTypeId)
        ->value('enabled_generated_documents');

    expect(Schema::hasColumn('ac_assistance_types', 'enabled_generated_documents'))->toBeTrue()
        ->and(json_decode((string) $stored, true, flags: JSON_THROW_ON_ERROR))
        ->toBe(AssistanceGeneratedDocument::values());

    $migration->down();

    expect(Schema::hasColumn('ac_assistance_types', 'enabled_generated_documents'))->toBeFalse();
});
