<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

it('adds the final Decedent registration fields without legacy data migration', function () {
    Schema::create('users', function (Blueprint $table) {
        $table->ulid('id')->primary();
    });
    Schema::create('cemetery_decedents', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->string('decedent_type');
        $table->string('death_certificate_no')->nullable();
        $table->date('date_of_registration');
        $table->timestamps();
        $table->softDeletes();
    });

    $migration = require database_path('migrations/2026_06_15_000001_add_cemetery_decedent_registration_fields.php');

    try {
        $migration->up();

        $id = (string) Str::ulid();
        DB::table('cemetery_decedents')->insert([
            'id' => $id,
            'municipal_id' => 'municipality-a',
            'decedent_type' => 'standard',
            'date_of_registration' => '2026-06-24',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $record = DB::table('cemetery_decedents')->where('id', $id)->first();

        expect(Schema::hasColumn('cemetery_decedents', 'vital_record_type'))->toBeTrue()
            ->and(Schema::hasColumn('cemetery_decedents', 'identity_status'))->toBeTrue()
            ->and(Schema::hasColumn('cemetery_decedents', 'registration_status'))->toBeTrue()
            ->and(Schema::hasColumn('cemetery_decedents', 'registry_number'))->toBeTrue()
            ->and($record->vital_record_type)->toBe('death')
            ->and($record->identity_status)->toBe('identified')
            ->and($record->registration_status)->toBe('draft')
            ->and((bool) $record->has_legal_name)->toBeTrue()
            ->and($record->version)->toBe(1);
    } finally {
        $migration->down();
        Schema::dropIfExists('cemetery_decedents');
        Schema::dropIfExists('users');
    }
});
