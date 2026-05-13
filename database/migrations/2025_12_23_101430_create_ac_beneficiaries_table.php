<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ac_beneficiaries', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('household_id')
                ->constrained('ac_households')
                ->cascadeOnDelete();

            $table->foreignUlid('user_id')
                ->nullable()
                ->after('id')
                ->constrained('users')
                ->nullOnDelete();

            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->string('suffix')->nullable();
            $table->string('sex')->nullable();
            $table->date('birth_date');

            $table->foreignUlid('religion_id')
                ->nullable()
                ->constrained('ac_religions')
                ->nullOnDelete();

            $table->string('educational_attainment')->nullable();

            // ── Data Privacy Act (RA 10173) consent record ───────────────────
            // Captured at profile-setup time. The citizen agreed to MSWD's terms
            // of registration + general privacy notice in order to be enrolled
            // in the beneficiary registry. Per-application consent is recorded
            // separately on ac_assistance_requests.
            $table->timestamp('terms_consented_at');
            $table->string('terms_version');

            $table->softDeletes();
            $table->timestamps();

            $table->index(['last_name', 'first_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ac_beneficiaries');
    }
};

