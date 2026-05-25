<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * Tracks active cooldowns per beneficiary per assistance type.
     * Populated when an assistance_request is approved (approved_at set).
     *
     * - For cooldown_scope = per_beneficiary: one row is inserted for the requesting beneficiary.
     * - For cooldown_scope = per_household:   one row is inserted for every registered household
     *                                         member at snapshot time, all sharing the same
     *                                         household_id so per-household lookups stay cheap.
     * - For cooldown_type  = one_time:        cooldown_expires_at is NULL (permanent block).
     * - For cooldown_type  = per_request:     cooldown_expires_at = approved_at + cooldown_months.
     *
     * The eligibility checker queries this table on every Action Center card-grid load
     * and again server-side when the citizen tries to access the request form URL.
     */
    public function up(): void
    {
        Schema::create('ac_beneficiary_cooldowns', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->foreignUlid('beneficiary_id')
                ->constrained('ac_beneficiaries')
                ->cascadeOnDelete();

            $table->foreignUlid('assistance_type_id')
                ->constrained('ac_assistance_types')
                ->cascadeOnDelete();

            $table->foreignUlid('assistance_request_id')
                ->constrained('ac_assistance_requests')
                ->cascadeOnDelete();

            $table->foreignUlid('household_member_id')
                ->nullable()
                ->after('beneficiary_id')
                ->constrained('ac_household_members')
                ->nullOnDelete();


            // The household the beneficiary belonged to at the time of approval.
            // Used for per_household scope eligibility checks (e.g., Financial Assistance E.O.).
            $table->foreignUlid('household_id')
                ->nullable()
                ->constrained('ac_households')
                ->nullOnDelete();

            // Always = the approved_at on the triggering ac_assistance_requests row.
            $table->timestamp('cooldown_starts_at');

            // NULL = permanent (one_time types like Burial Assistance).
            // Otherwise = cooldown_starts_at + assistance_type.cooldown_months.
            $table->timestamp('cooldown_expires_at')->nullable();

            $table->timestamps();

            // One cooldown row per (beneficiary, type, request) — idempotent inserts.
            $table->unique(
                ['beneficiary_id', 'assistance_type_id', 'assistance_request_id'],
                'ac_cooldowns_beneficiary_type_request_unique'
            );

            // Hot path: "is this beneficiary on cooldown for this type right now?"
            $table->index(
                ['beneficiary_id', 'assistance_type_id', 'cooldown_expires_at'],
                'ac_cooldowns_beneficiary_type_expires_idx'
            );

            // Hot path: "is anyone in this household on cooldown for this type right now?"
            $table->index(
                ['household_id', 'assistance_type_id', 'cooldown_expires_at'],
                'ac_cooldowns_household_type_expires_idx'
            );

            $table->index(
                ['household_member_id', 'assistance_type_id', 'cooldown_expires_at'],
                'ac_cooldowns_member_type_expires_idx'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ac_beneficiary_cooldowns');
    }
};
