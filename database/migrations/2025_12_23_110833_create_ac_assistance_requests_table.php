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

            $table->string('relationship_to_beneficiary')->nullable()->after('beneficiary_id');
            // Amount is NOT requested by the citizen. It is set only when the mayor / approver
            // grants the assistance. Bounded by ac_assistance_types.min_amount / max_amount.
            $table->decimal('amount_approved', 10, 2)->nullable();

            $table->string('transaction_number')->unique();

            $table->string('status')->default('pending');  // pending | under_review | approved | released | rejected

            $table->text('description')->nullable();      // citizen's reason for the request
            $table->text('remarks')->nullable();          // admin notes during review

            // Workflow timestamps. approved_at starts the cooldown clock.
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('released_at')->nullable();

            // ── Data Privacy Act (RA 10173) consent record ───────────────────
            // The citizen must explicitly tick the privacy notice on each apply
            // submission. We persist *when* they consented and *which version*
            // of the notice they agreed to so NPC accountability obligations
            // can be satisfied without depending on log files.
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

            // ── Address snapshot ─────────────────────────────────────────────
            // Frozen copy of ac_households at submission time. Province is
            // omitted — municipal_id (above) pins the municipality and province
            // is derivable. snapshot_barangay_psgc_code enables reliable GROUP BY
            // queries without depending on name-string matching.
            $table->string('snapshot_barangay')->nullable();
            $table->string('snapshot_barangay_psgc_code')->nullable();
            $table->string('snapshot_street')->nullable();

            $table->softDeletes();
            $table->timestamps();

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
