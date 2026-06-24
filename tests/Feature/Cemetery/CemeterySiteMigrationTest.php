<?php

use Illuminate\Database\QueryException;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

beforeEach(function () {
    Schema::create('municipalities', function (Blueprint $table) {
        $table->ulid('id')->primary();
    });

    $this->migration = require database_path('migrations/2026_06_14_000002_create_cemetery_sites_table.php');
    $this->migration->up();
});

afterEach(function () {
    $this->migration->down();
    Schema::dropIfExists('municipalities');
});

it('creates municipality-owned cemetery sites with flattened addresses', function () {
    $municipalId = (string) Str::ulid();
    $siteId = (string) Str::ulid();

    DB::table('municipalities')->insert(['id' => $municipalId]);
    DB::table('cemetery_sites')->insert([
        'id' => $siteId,
        'municipal_id' => $municipalId,
        'name' => 'GASAN CENTRAL CEMETERY',
    ]);

    $site = DB::table('cemetery_sites')->where('id', $siteId)->first();

    expect(Schema::hasColumn('cemetery_sites', 'municipal_id'))->toBeTrue()
        ->and(Schema::hasColumn('cemetery_sites', 'psgc_barangay_code'))->toBeTrue()
        ->and(Schema::hasColumn('cemetery_sites', 'street_name'))->toBeTrue()
        ->and(Schema::hasColumn('cemetery_sites', 'notes'))->toBeTrue()
        ->and(Schema::hasColumn('cemetery_sites', 'deleted_at'))->toBeTrue()
        ->and($site->status)->toBe('active')
        ->and($site->psgc_barangay_code)->toBeNull()
        ->and($site->street_name)->toBeNull();
});

it('keeps cemetery site names unique within a municipality', function () {
    $gasanId = (string) Str::ulid();
    $boacId = (string) Str::ulid();

    DB::table('municipalities')->insert([
        ['id' => $gasanId],
        ['id' => $boacId],
    ]);
    DB::table('cemetery_sites')->insert([
        [
            'id' => (string) Str::ulid(),
            'municipal_id' => $gasanId,
            'name' => 'CENTRAL CEMETERY',
        ],
        [
            'id' => (string) Str::ulid(),
            'municipal_id' => $boacId,
            'name' => 'CENTRAL CEMETERY',
        ],
    ]);

    expect(fn () => DB::table('cemetery_sites')->insert([
        'id' => (string) Str::ulid(),
        'municipal_id' => $gasanId,
        'name' => 'CENTRAL CEMETERY',
    ]))->toThrow(QueryException::class);
});

it('restricts municipality deletion while cemetery sites exist', function () {
    $municipalId = (string) Str::ulid();

    DB::table('municipalities')->insert(['id' => $municipalId]);
    DB::table('cemetery_sites')->insert([
        'id' => (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'name' => 'GASAN CENTRAL CEMETERY',
    ]);

    expect(fn () => DB::table('municipalities')->where('id', $municipalId)->delete())
        ->toThrow(QueryException::class);
});
