<?php

use App\Core\Cemetery\Actions\PreserveCemeteryActivityLogAction;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

beforeEach(function () {
    Schema::create('activity_log', function (Blueprint $table) {
        $table->id();
        $table->string('log_name')->nullable();
        $table->text('description');
        $table->string('subject_type')->nullable();
        $table->ulid('subject_id')->nullable();
        $table->string('event')->nullable();
        $table->string('causer_type')->nullable();
        $table->ulid('causer_id')->nullable();
        $table->json('attribute_changes')->nullable();
        $table->json('properties')->nullable();
        $table->timestamps();
    });
});

afterEach(function () {
    Schema::dropIfExists('activity_log');
});

it('preserves cemetery logs while deleting other expired activity', function () {
    DB::table('activity_log')->insert([
        [
            'log_name' => 'cemetery_decedent',
            'description' => 'Permanent cemetery history',
            'created_at' => now()->subYears(2),
            'updated_at' => now()->subYears(2),
        ],
        [
            'log_name' => 'action_center',
            'description' => 'Expired ordinary history',
            'created_at' => now()->subYears(2),
            'updated_at' => now()->subYears(2),
        ],
    ]);

    $deleted = (new PreserveCemeteryActivityLogAction)->execute(365);

    expect($deleted)->toBe(1)
        ->and(DB::table('activity_log')->pluck('log_name')->all())->toBe(['cemetery_decedent']);
});
