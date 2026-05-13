<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds the authorized-representative name fields to ac_assistance_requests.
 *
 * These columns are populated when a citizen files on behalf of a family
 * member (any program) or on behalf of a deceased person (burial program).
 * All columns are nullable — null means the applicant filed for themselves.
 *
 * `relationship_to_beneficiary` already exists (added in the original migration);
 * this migration adds the remaining personal-detail columns.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ac_assistance_requests', function (Blueprint $table) {
            // Name of the person being assisted / the deceased
            $table->string('on_behalf_first_name')->nullable()->after('relationship_to_beneficiary');
            $table->string('on_behalf_middle_name')->nullable()->after('on_behalf_first_name');
            $table->string('on_behalf_last_name')->nullable()->after('on_behalf_middle_name');
            $table->string('on_behalf_suffix')->nullable()->after('on_behalf_last_name');

            // Burial-specific: date the deceased passed away
            $table->date('on_behalf_date_of_death')->nullable()->after('on_behalf_suffix');
        });
    }

    public function down(): void
    {
        Schema::table('ac_assistance_requests', function (Blueprint $table) {
            $table->dropColumn([
                'on_behalf_first_name',
                'on_behalf_middle_name',
                'on_behalf_last_name',
                'on_behalf_suffix',
                'on_behalf_date_of_death',
            ]);
        });
    }
};
