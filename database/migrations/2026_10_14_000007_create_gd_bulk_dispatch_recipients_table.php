<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gd_bulk_dispatch_recipients', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->ulid('municipal_id');
            $table->ulid('bulk_dispatch_id');
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->string('suffix')->nullable();
            $table->text('normalized_name');
            $table->string('barangay', 150)->nullable();
            $table->string('purok')->nullable();
            $table->date('received_on')->nullable();
            $table->string('collector_name')->nullable();
            $table->string('collector_relationship', 150)->nullable();
            $table->string('paper_reference', 150)->nullable();
            $table->string('paper_row', 50)->nullable();
            $table->string('acknowledgement', 24)->nullable();
            $table->text('remarks')->nullable();
            $table->string('status', 24)->default('active');
            $table->unsignedInteger('version')->default(1);
            $table->string('submission_key', 100);
            $table->string('submission_hash', 64);
            $table->ulid('created_by_user_id')->nullable();
            $table->ulid('updated_by_user_id')->nullable();
            $table->ulid('voided_by_user_id')->nullable();
            $table->timestamp('voided_at')->nullable();
            $table->text('void_reason')->nullable();
            $table->timestamps();
            $table->unique(['municipal_id', 'submission_key'], 'gd_bulk_recipient_submission_unique');
            $table->unique(['id', 'bulk_dispatch_id', 'municipal_id'], 'gd_bulk_recipient_id_dispatch_tenant_unique');
            $table->index(['bulk_dispatch_id', 'municipal_id', 'status'], 'gd_bulk_recipient_list_idx');
            $table->foreign(['bulk_dispatch_id', 'municipal_id'], 'gd_bulk_recipient_dispatch_fk')->references(['id', 'municipal_id'])->on('gd_bulk_dispatches')->restrictOnDelete();
            $table->foreign('created_by_user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('updated_by_user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('voided_by_user_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gd_bulk_dispatch_recipients');
    }
};
