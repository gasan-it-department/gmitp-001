<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Links an assistance request to the household member being assisted.
 *
 * Mirrors the inline on_behalf_* snapshot columns added in
 * 2026_05_11_171434_add_on_behalf_columns_to_ac_assistance_requests_table.
 * Those columns continue to hold the frozen name/date-of-death for audit;
 * this FK enables per-family-member history and per-deceased eligibility
 * (e.g. one Burial Assistance per deceased person, ever).
 *
 *   NULL     → filer requested for themselves
 *   NOT NULL → filer requested on behalf of this household member
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ac_assistance_requests', function (Blueprint $table) {
            $table->foreignUlid('on_behalf_household_member_id')
                ->nullable()
                ->after('on_behalf_date_of_death')
                ->constrained('ac_household_members')
                ->nullOnDelete();

            $table->index(
                ['on_behalf_household_member_id', 'assistance_type_id', 'status', 'approved_at'],
                'ac_requests_on_behalf_member_type_idx'
            );
        });
    }

    public function down(): void
    {
        Schema::table('ac_assistance_requests', function (Blueprint $table) {
            $table->dropIndex('ac_requests_on_behalf_member_type_idx');
            $table->dropConstrainedForeignId('on_behalf_household_member_id');
        });
    }
};
