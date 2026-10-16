<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gd_bulk_dispatch_additional_issues', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->ulid('municipal_id');
            $table->ulid('bulk_dispatch_id');
            $table->string('status', 20)->default('pending');
            $table->text('reason');
            $table->json('lines_snapshot');
            $table->string('submission_operation_key', 100);
            $table->unsignedInteger('approval_revision')->nullable();
            $table->ulid('created_by_user_id')->nullable();
            $table->ulid('approved_by_user_id')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->ulid('issued_by_user_id')->nullable();
            $table->timestamp('issued_at')->nullable();
            $table->date('actual_issue_on')->nullable();
            $table->boolean('custodian_acknowledged')->default(false);
            $table->ulid('cancelled_by_user_id')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->timestamps();
            $table->unique(['id', 'bulk_dispatch_id', 'municipal_id'], 'gd_bulk_extra_id_dispatch_tenant_unique');
            $table->unique(['bulk_dispatch_id', 'submission_operation_key'], 'gd_bulk_extra_submission_unique');
            $table->index(['municipal_id', 'bulk_dispatch_id', 'status'], 'gd_bulk_extra_status_idx');
            $table->foreign(['bulk_dispatch_id', 'municipal_id'], 'gd_bulk_extra_dispatch_fk')->references(['id', 'municipal_id'])->on('gd_bulk_dispatches')->restrictOnDelete();
            $table->foreign('created_by_user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('approved_by_user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('issued_by_user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('cancelled_by_user_id')->references('id')->on('users')->nullOnDelete();
        });
        Schema::table('gd_bulk_dispatch_stock_allocations', function (Blueprint $table): void {
            $table->ulid('additional_issue_id')->nullable();
            $table->foreign(['additional_issue_id', 'bulk_dispatch_id', 'municipal_id'], 'gd_bulk_alloc_extra_fk')
                ->references(['id', 'bulk_dispatch_id', 'municipal_id'])->on('gd_bulk_dispatch_additional_issues')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('gd_bulk_dispatch_stock_allocations', function (Blueprint $table): void {
            $table->dropForeign('gd_bulk_alloc_extra_fk');
            $table->dropColumn('additional_issue_id');
        });
        Schema::dropIfExists('gd_bulk_dispatch_additional_issues');
    }
};
