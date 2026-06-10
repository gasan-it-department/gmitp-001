<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Add the beneficiary identity-management fields in one schema transition:
 *
 * - intrinsic municipality ownership and one beneficiary per user per LGU
 * - lifecycle activation without deleting historical records
 * - non-destructive duplicate merging through a self-referencing canonical link
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('ac_beneficiaries', function (Blueprint $table) {
            $table->foreignUlid('municipal_id')
                ->after('user_id')
                ->constrained('municipalities')
                ->restrictOnDelete();

            $table->boolean('is_active')
                ->default(true)
                ->after('municipal_id');

            $table->foreignUlid('merged_into_beneficiary_id')
                ->nullable()
                ->after('is_active')
                ->constrained('ac_beneficiaries')
                ->nullOnDelete();

            $table->dropUnique(['user_id']);
            $table->unique(['user_id', 'municipal_id']);
        });
    }

    public function down(): void
    {
        Schema::table('ac_beneficiaries', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'municipal_id']);
            $table->unique('user_id');

            $table->dropForeign(['municipal_id']);
            $table->dropConstrainedForeignId('merged_into_beneficiary_id');
            $table->dropColumn(['municipal_id', 'is_active']);
        });
    }
};
