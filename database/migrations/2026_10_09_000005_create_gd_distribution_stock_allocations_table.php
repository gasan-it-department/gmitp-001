<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gd_distribution_stock_allocations', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->ulid('municipal_id');
            $table->ulid('distribution_request_id');
            $table->ulid('distribution_request_line_id');
            $table->ulid('stock_receipt_line_id');
            $table->string('base_unit', 16);
            $table->unsignedInteger('approval_revision');
            $table->decimal('quantity', 15, 3);
            $table->string('status', 20)->default('reserved');
            $table->timestamps();
            $table->unique(['id', 'municipal_id', 'stock_receipt_line_id'], 'gd_allocations_id_tenant_batch_unique');
            $table->unique(['distribution_request_line_id', 'approval_revision', 'stock_receipt_line_id'], 'gd_allocations_revision_unique');
            $table->index(['stock_receipt_line_id', 'status'], 'gd_allocations_reserved_idx');
            $table->foreign(['distribution_request_id', 'municipal_id'], 'gd_allocations_request_fk')->references(['id', 'municipal_id'])->on('gd_distribution_requests')->restrictOnDelete();
            $table->foreign(['distribution_request_line_id', 'distribution_request_id', 'municipal_id'], 'gd_allocations_request_line_fk')->references(['id', 'distribution_request_id', 'municipal_id'])->on('gd_distribution_request_lines')->restrictOnDelete();
            $table->foreign(['stock_receipt_line_id', 'municipal_id', 'base_unit'], 'gd_allocations_batch_tenant_unit_fk')->references(['id', 'municipal_id', 'base_unit'])->on('gd_stock_receipt_lines')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gd_distribution_stock_allocations');
    }
};
