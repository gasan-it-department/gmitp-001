<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gd_distribution_cooldowns', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('municipal_id');
            $table->ulid('program_id');
            $table->ulid('distribution_request_id');
            $table->ulid('household_id');
            $table->ulid('household_member_id');
            $table->ulid('beneficiary_id')->nullable();
            $table->foreign('municipal_id')->references('id')->on('municipalities')->restrictOnDelete();
            $table->foreign('program_id')->references('id')->on('gd_programs')->restrictOnDelete();
            $table->foreign('distribution_request_id')->references('id')->on('gd_distribution_requests')->restrictOnDelete();
            $table->foreign('household_id')->references('id')->on('ac_households')->restrictOnDelete();
            $table->foreign('household_member_id')->references('id')->on('ac_household_members')->restrictOnDelete();
            $table->foreign('beneficiary_id')->references('id')->on('ac_beneficiaries')->restrictOnDelete();
            $table->string('scope', 20);
            $table->unsignedInteger('duration');
            $table->string('unit', 10);
            $table->date('starts_on');
            $table->date('ends_on');
            $table->timestamp('created_at');
            $table->unique(['distribution_request_id', 'household_member_id'], 'gd_cooldown_request_member_unique');
            $table->index(['municipal_id', 'program_id', 'beneficiary_id', 'ends_on'], 'gd_cooldown_beneficiary_lookup');
            $table->index(['municipal_id', 'program_id', 'household_member_id', 'ends_on'], 'gd_cooldown_member_lookup');
            $table->index(['municipal_id', 'program_id', 'household_id', 'ends_on'], 'gd_cooldown_household_lookup');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gd_distribution_cooldowns');
    }
};
