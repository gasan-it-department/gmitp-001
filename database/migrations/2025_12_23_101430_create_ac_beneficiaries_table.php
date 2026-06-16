<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
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
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignUlid('municipal_id')
                ->constrained('municipalities')
                ->restrictOnDelete();

            $table->boolean('is_active')->default(true);

            $table->ulid('merged_into_beneficiary_id')->nullable();

            $table->timestamp('identity_verified_at')->nullable();

            $table->foreignUlid('identity_verified_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('intake_rejected_at')->nullable();

            $table->foreignUlid('intake_rejected_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('intake_rejection_reason', 1000)->nullable();

            $table->string('beneficiary_number')->nullable()->unique();
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
            $table->decimal('monthly_income', 10, 2)->default(0);
            $table->timestamp('terms_consented_at');
            $table->string('terms_version');

            $table->softDeletes();
            $table->timestamps();

            $table->index(['last_name', 'first_name']);
            $table->index(
                ['municipal_id', 'identity_verified_at'],
                'ac_beneficiaries_municipal_identity_verified_idx',
            );
            $table->index(
                ['municipal_id', 'intake_rejected_at'],
                'ac_beneficiaries_municipal_intake_rejected_idx',
            );
            $table->unique(['user_id', 'municipal_id']);
        });

        Schema::table('ac_beneficiaries', function (Blueprint $table) {
            $table->foreign('merged_into_beneficiary_id')
                ->references('id')
                ->on('ac_beneficiaries')
                ->nullOnDelete();
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
