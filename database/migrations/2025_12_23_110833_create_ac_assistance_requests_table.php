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

        Schema::create('ac_assistance_requests', function (Blueprint $table) {

            $table->ulid('id')->primary();

            $table->foreignUlid('municipal_id')
                ->constrained('municipalities')
                ->restrictOnDelete();

            $table->foreignUlid('beneficiary_id')
                ->constrained('ac_beneficiaries')
                ->onDelete('cascade');

            $table->foreignUlid('household_id')
                ->constrained('ac_households')
                ->restrictOnDelete();

            $table->foreignUlid('encoded_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignUlid('assistance_type_id')
                ->constrained('ac_assistance_types')
                ->restrictOnDelete();

            // Reviewers / approvers — populated as the request moves through the workflow.
            $table->foreignUlid('reviewed_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignUlid('approved_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignUlid('rejected_by_user_id')
                ->nullable()
                ->after('approved_by_user_id')
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignUlid('cancelled_by_user_id')
                ->nullable()
                ->after('rejected_by_user_id')
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignUlid('released_by_user_id')
                ->nullable()
                ->after('cancelled_by_user_id')
                ->constrained('users')
                ->nullOnDelete();

            $table->string('release_reference_number', 60)
                ->nullable()
                ->after('released_by_user_id');

            $table->string('relationship_to_beneficiary')->nullable();

            $table->decimal('amount_approved', 10, 2)->nullable();

            $table->string('transaction_number')->unique();

            $table->string('status')->default('pending');

            $table->text('description')->nullable();

            $table->text('remarks')->nullable();          // admin notes during review

            // Workflow timestamps. approved_at starts the cooldown clock.
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('released_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('rejected_at')->nullable();

            $table->timestamp('privacy_consented_at');
            $table->string('privacy_notice_version');

            // ── Identity snapshot ────────────────────────────────────────────
            // Frozen copy of ac_beneficiaries at submission time. If the citizen
            // later edits their profile the historical request is unaffected.
            $table->string('snapshot_first_name');
            $table->string('snapshot_last_name');
            $table->string('snapshot_middle_name')->nullable();
            $table->string('snapshot_suffix')->nullable();
            $table->string('snapshot_sex')->nullable();
            $table->date('snapshot_birth_date')->nullable();
            $table->string('snapshot_educational_attainment')->nullable();
            $table->string('snapshot_religion')->nullable();
            $table->string('snapshot_barangay')->nullable();
            $table->string('snapshot_barangay_psgc_code')->nullable();
            $table->string('snapshot_street')->nullable();
            $table->string('snapshot_occupation')->nullable();
            $table->decimal('snapshot_monthly_income', 10, 2)->nullable();
            $table->decimal('snapshot_household_total_income', 10, 2)->nullable();
            $table->string('snapshot_civil_status')->nullable();


            $table->softDeletes();
            $table->timestamps();

            $table->unique(
                ['municipal_id', 'release_reference_number'],
                'ac_assistance_requests_release_ref_unique',
            );
            // Indexes that the eligibility checker and admin dashboard will rely on heavily.
            $table->index(['beneficiary_id', 'assistance_type_id', 'status', 'approved_at']);
            $table->index(['household_id', 'assistance_type_id', 'status', 'approved_at']);
            $table->index(['municipal_id', 'status', 'created_at']);


        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ac_assistance_requests');
    }
};
