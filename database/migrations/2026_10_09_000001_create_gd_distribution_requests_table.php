<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gd_distribution_requests', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->ulid('municipal_id');
            $table->ulid('program_id');
            $table->ulid('storage_location_id');
            $table->string('program_name_snapshot');
            $table->string('storage_name_snapshot');
            $table->ulid('beneficiary_id');
            $table->ulid('household_id');
            $table->ulid('assisted_household_member_id')->nullable();
            $table->string('reference', 80);
            $table->string('submission_key', 100);
            $table->string('submission_hash', 64);
            $table->string('status', 24)->default('pending');
            $table->unsignedInteger('version')->default(1);
            $table->unsignedInteger('approval_revision')->default(0);
            $table->json('filing_snapshot');
            $table->json('reviewed_snapshot');
            $table->json('handover_snapshot')->nullable();
            $table->json('cooldown_policy')->nullable();
            $table->json('cooldown_exception_authorization')->nullable();
            $table->json('operations')->nullable();
            $table->text('notes')->nullable();
            $table->text('transition_reason')->nullable();
            $table->ulid('created_by_user_id')->nullable();
            $table->foreign('created_by_user_id')->references('id')->on('users')->nullOnDelete();

            $table->ulid('reviewed_by_user_id')->nullable();
            $table->foreign('reviewed_by_user_id')->references('id')->on('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();

            $table->ulid('approved_by_user_id')->nullable();
            $table->foreign('approved_by_user_id')->references('id')->on('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();

            $table->ulid('returned_by_user_id')->nullable();
            $table->foreign('returned_by_user_id')->references('id')->on('users')->nullOnDelete();
            $table->timestamp('returned_at')->nullable();

            $table->ulid('cancelled_by_user_id')->nullable();
            $table->foreign('cancelled_by_user_id')->references('id')->on('users')->nullOnDelete();
            $table->timestamp('cancelled_at')->nullable();

            $table->ulid('released_by_user_id')->nullable();
            $table->foreign('released_by_user_id')->references('id')->on('users')->nullOnDelete();
            $table->timestamp('released_at')->nullable();
            $table->date('actual_release_on')->nullable();
            $table->string('collector_type', 24)->nullable();
            $table->string('collector_name')->nullable();
            $table->string('collector_relationship', 100)->nullable();
            $table->string('collector_id_type', 100)->nullable();
            $table->string('collector_id_last_four', 4)->nullable();
            $table->timestamp('identity_inspected_at')->nullable();
            $table->boolean('acknowledgement_confirmed')->default(false);
            $table->string('acknowledgement_reference', 150)->nullable();
            $table->text('release_notes')->nullable();
            $table->timestamps();
            $table->unique(['municipal_id', 'submission_key'], 'gd_requests_submission_unique');
            $table->unique(['municipal_id', 'reference'], 'gd_requests_reference_tenant_unique');
            $table->unique(['id', 'municipal_id'], 'gd_requests_id_tenant_unique');
            $table->index(['municipal_id', 'status', 'created_at'], 'gd_requests_queue_idx');
            $table->index(['municipal_id', 'household_id', 'created_at'], 'gd_requests_household_idx');
            $table->foreign(['program_id', 'municipal_id'], 'gd_requests_program_tenant_fk')->references(['id', 'municipal_id'])->on('gd_programs')->restrictOnDelete();
            $table->foreign(['storage_location_id', 'municipal_id'], 'gd_requests_storage_tenant_fk')->references(['id', 'municipal_id'])->on('gd_storage_locations')->restrictOnDelete();
            $table->foreign('municipal_id')->references('id')->on('municipalities')->restrictOnDelete();
            $table->foreign('beneficiary_id')->references('id')->on('ac_beneficiaries')->restrictOnDelete();
            $table->foreign('household_id')->references('id')->on('ac_households')->restrictOnDelete();
            $table->foreign('assisted_household_member_id')->references('id')->on('ac_household_members')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gd_distribution_requests');
    }
};
