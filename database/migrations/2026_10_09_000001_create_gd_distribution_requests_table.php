<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
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
            $table->string('reference', 80)->unique();
            $table->string('submission_key', 100);
            $table->string('submission_hash', 64);
            $table->string('status', 24)->default('pending');
            $table->unsignedInteger('version')->default(1);
            $table->unsignedInteger('approval_revision')->default(0);
            $table->json('filing_snapshot');
            $table->json('reviewed_snapshot');
            $table->json('handover_snapshot')->nullable();
            $table->json('operations')->nullable();
            $table->text('notes')->nullable();
            $table->text('transition_reason')->nullable();
            foreach (['created', 'reviewed', 'approved', 'returned', 'cancelled', 'released'] as $stage) {
                $table->ulid($stage.'_by_user_id')->nullable();
                $table->foreign($stage.'_by_user_id')->references('id')->on('users')->nullOnDelete();
                if ($stage !== 'created') {
                    $table->timestamp($stage.'_at')->nullable();
                }
            }
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
            $table->unique(['id', 'municipal_id'], 'gd_requests_id_tenant_unique');
            $table->index(['municipal_id', 'status', 'created_at'], 'gd_requests_queue_idx');
            $table->index(['municipal_id', 'household_id', 'created_at'], 'gd_requests_household_idx');
            $table->foreign(['program_id', 'municipal_id'], 'gd_requests_program_tenant_fk')->references(['id', 'municipal_id'])->on('gd_programs')->restrictOnDelete();
            $table->foreign(['storage_location_id', 'municipal_id'], 'gd_requests_storage_tenant_fk')->references(['id', 'municipal_id'])->on('gd_storage_locations')->restrictOnDelete();
            foreach (['municipal_id' => 'municipalities', 'beneficiary_id' => 'ac_beneficiaries', 'household_id' => 'ac_households', 'assisted_household_member_id' => 'ac_household_members'] as $column => $target) {
                $table->foreign($column)->references('id')->on($target)->restrictOnDelete();
            }
        });
        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE gd_distribution_requests ADD CONSTRAINT gd_requests_status_check CHECK (status IN ('pending', 'under_review', 'returned', 'approved', 'released', 'cancelled'))");
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('gd_distribution_requests');
    }
};
