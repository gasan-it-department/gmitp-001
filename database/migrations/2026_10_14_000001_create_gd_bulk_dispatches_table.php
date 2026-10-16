<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gd_bulk_dispatches', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->ulid('municipal_id');
            $table->ulid('program_id');
            $table->ulid('storage_location_id');
            $table->string('reference', 80);
            $table->string('submission_key', 100);
            $table->string('submission_hash', 64);
            $table->string('status', 24)->default('draft');
            $table->unsignedInteger('version')->default(1);
            $table->unsignedInteger('approval_revision')->default(0);
            $table->string('program_name_snapshot');
            $table->string('storage_name_snapshot');
            $table->string('requester_name')->nullable();
            $table->string('requester_role')->nullable();
            $table->string('custodian_type', 24)->default('staff');
            $table->ulid('custodian_user_id')->nullable();
            $table->string('custodian_name')->nullable();
            $table->string('custodian_role')->nullable();
            $table->json('destination_barangays');
            $table->text('location_notes')->nullable();
            $table->text('purpose')->nullable();
            $table->text('purpose_notes')->nullable();
            $table->string('paper_reference', 150)->nullable();
            $table->json('approval_snapshot')->nullable();
            $table->json('operations')->nullable();
            $table->text('transition_reason')->nullable();
            $table->ulid('created_by_user_id')->nullable();
            $table->ulid('approved_by_user_id')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->ulid('dispatched_by_user_id')->nullable();
            $table->timestamp('dispatched_at')->nullable();
            $table->date('actual_dispatch_on')->nullable();
            $table->boolean('custodian_acknowledged')->default(false);
            $table->ulid('closed_by_user_id')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->ulid('cancelled_by_user_id')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->ulid('reopened_by_user_id')->nullable();
            $table->timestamp('reopened_at')->nullable();
            $table->timestamps();
            $table->unique(['municipal_id', 'submission_key'], 'gd_bulk_submission_unique');
            $table->unique(['municipal_id', 'reference'], 'gd_bulk_reference_tenant_unique');
            $table->unique(['id', 'municipal_id'], 'gd_bulk_id_tenant_unique');
            $table->index(['municipal_id', 'status', 'created_at'], 'gd_bulk_queue_idx');
            $table->foreign('municipal_id')->references('id')->on('municipalities')->restrictOnDelete();
            $table->foreign(['program_id', 'municipal_id'], 'gd_bulk_program_fk')->references(['id', 'municipal_id'])->on('gd_programs')->restrictOnDelete();
            $table->foreign(['storage_location_id', 'municipal_id'], 'gd_bulk_storage_fk')->references(['id', 'municipal_id'])->on('gd_storage_locations')->restrictOnDelete();
            $table->foreign('custodian_user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('created_by_user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('approved_by_user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('dispatched_by_user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('closed_by_user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('cancelled_by_user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('reopened_by_user_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gd_bulk_dispatches');
    }
};
