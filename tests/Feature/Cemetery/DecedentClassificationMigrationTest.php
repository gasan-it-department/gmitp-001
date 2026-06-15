<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

beforeEach(function () {
    Schema::create('users', function (Blueprint $table) {
        $table->ulid('id')->primary();
    });

    Schema::create('cemetery_decedents', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->string('decedent_type');
        $table->string('death_certificate_no')->nullable();
        $table->date('date_of_registration')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });
});

afterEach(function () {
    Schema::dropIfExists('cemetery_decedents');
    Schema::dropIfExists('users');
});

it('maps legacy classifications into independent vital record and identity states', function () {
    foreach ([
        ['type' => 'standard', 'certificate' => 'STD-1'],
        ['type' => 'child', 'certificate' => 'CHILD-1'],
        ['type' => 'fetal', 'certificate' => 'FETAL-1'],
        ['type' => 'unknown', 'certificate' => null],
    ] as $legacy) {
        DB::table('cemetery_decedents')->insert([
            'id' => (string) Str::ulid(),
            'municipal_id' => 'municipality-a',
            'decedent_type' => $legacy['type'],
            'death_certificate_no' => $legacy['certificate'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    $migration = require database_path('migrations/2026_06_15_000001_complete_cemetery_decedent_registration.php');
    $migration->up();

    $records = DB::table('cemetery_decedents')->orderBy('decedent_type')->get()->keyBy('decedent_type');

    expect($records['standard']->vital_record_type)->toBe('death')
        ->and($records['standard']->identity_status)->toBe('identified')
        ->and($records['standard']->registry_number)->toBe('STD-1')
        ->and($records['child']->vital_record_type)->toBe('death')
        ->and($records['child']->identity_status)->toBe('identified')
        ->and($records['fetal']->vital_record_type)->toBe('fetal_death')
        ->and($records['fetal']->identity_status)->toBe('identified')
        ->and((bool) $records['fetal']->has_legal_name)->toBeFalse()
        ->and($records['unknown']->vital_record_type)->toBe('death')
        ->and($records['unknown']->identity_status)->toBe('unidentified')
        ->and($records->pluck('registration_status')->unique()->all())->toBe(['pending_review']);
});
