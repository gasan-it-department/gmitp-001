<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

beforeEach(function () {
    Schema::create('psgc_municipalities', function (Blueprint $table) {
        $table->id();
        $table->string('name');
    });

    Schema::create('psgc_barangays', function (Blueprint $table) {
        $table->id();
        $table->foreignId('municipality_id')->constrained('psgc_municipalities');
        $table->string('psgc_code', 20)->unique();
        $table->string('name');
    });

    Schema::create('addresses', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->foreignId('psgc_municipality_id')->nullable()->constrained('psgc_municipalities');
        $table->foreignId('psgc_barangay_id')->nullable()->constrained('psgc_barangays');
        $table->json('address_snapshot')->nullable();
    });

    Schema::create('cemetery_decedents', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->foreignUlid('address_id')->nullable()->constrained('addresses');
    });
});

afterEach(function () {
    Schema::dropIfExists('cemetery_decedents');
    Schema::dropIfExists('addresses');
    Schema::dropIfExists('psgc_barangays');
    Schema::dropIfExists('psgc_municipalities');
});

it('backfills flat address fields and removes the cemetery address foreign key', function () {
    $municipalityId = DB::table('psgc_municipalities')->insertGetId(['name' => 'GASAN']);
    $barangayId = DB::table('psgc_barangays')->insertGetId([
        'municipality_id' => $municipalityId,
        'psgc_code' => '174001001',
        'name' => 'ANTIPOLO',
    ]);
    $addressId = (string) Str::ulid();
    DB::table('addresses')->insert([
        'id' => $addressId,
        'psgc_municipality_id' => $municipalityId,
        'psgc_barangay_id' => $barangayId,
        'address_snapshot' => json_encode(['street' => 'Purok 2']),
    ]);
    $decedentId = (string) Str::ulid();
    DB::table('cemetery_decedents')->insert(['id' => $decedentId, 'address_id' => $addressId]);

    $migration = require database_path('migrations/2026_06_15_000005_flatten_cemetery_decedent_addresses.php');
    $migration->up();

    $record = DB::table('cemetery_decedents')->where('id', $decedentId)->first();

    expect(Schema::hasColumn('cemetery_decedents', 'address_id'))->toBeFalse()
        ->and($record->psgc_municipality_id)->toBe($municipalityId)
        ->and($record->psgc_barangay_code)->toBe('174001001')
        ->and($record->street_name)->toBe('PUROK 2');
});
