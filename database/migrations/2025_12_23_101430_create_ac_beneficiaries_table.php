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

            $table->string('civil_status')->nullable();
            $table->string('occupation')->nullable();
            // Same shape as ac_household_members: decimal(10,2) with default 0
            $table->decimal('monthly_income', 10, 2)->default(0);

            $table->timestamp('terms_consented_at');
            $table->string('terms_version');

            $table->softDeletes();
            $table->timestamps();

            $table->index(['last_name', 'first_name']);

            // One portal user can only ever own ONE beneficiary record.
            // Walk-ins keep user_id NULL — SQL allows multiple NULLs in a
            // UNIQUE column so this does not block them.
            //
            // This is the last-line safety net against duplicate submissions
            // from double-clicks, network retries, concurrent tabs, or
            // bypassed front-end validation. The action layer also guards
            // this with a row lock, but the DB is the source of truth.
            $table->unique('user_id');
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

