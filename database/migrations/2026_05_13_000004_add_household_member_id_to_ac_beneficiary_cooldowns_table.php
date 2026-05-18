<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds a nullable household_member_id FK to ac_beneficiary_cooldowns so
 * cooldowns can be attached to the actual person being assisted, not just
 * the filer.
 *
 *   NULL     → self-filed (unchanged behaviour; cooldown is on beneficiary_id)
 *   NOT NULL → on-behalf request; eligibility for one_time scopes (e.g.
 *              Burial Assistance) is keyed on this household member so the
 *              same filer can lawfully claim burial for different relatives.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ac_beneficiary_cooldowns', function (Blueprint $table) {
            $table->foreignUlid('household_member_id')
                ->nullable()
                ->after('beneficiary_id')
                ->constrained('ac_household_members')
                ->nullOnDelete();

            $table->index(
                ['household_member_id', 'assistance_type_id', 'cooldown_expires_at'],
                'ac_cooldowns_member_type_expires_idx'
            );
        });
    }

    public function down(): void
    {
        Schema::table('ac_beneficiary_cooldowns', function (Blueprint $table) {
            $table->dropIndex('ac_cooldowns_member_type_expires_idx');
            $table->dropConstrainedForeignId('household_member_id');
        });
    }
};
