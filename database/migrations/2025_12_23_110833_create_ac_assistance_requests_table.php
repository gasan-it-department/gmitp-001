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

            // Denormalized address snapshot — preserved per request even if household address changes.
            $table->string('province')->default('MARINDUQUE');
            $table->string('municipality');
            $table->string('barangay');
            $table->string('street')->nullable();

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
