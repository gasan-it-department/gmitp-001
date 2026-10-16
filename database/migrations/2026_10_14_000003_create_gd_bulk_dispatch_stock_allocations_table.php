<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gd_bulk_dispatch_stock_allocations', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->ulid('municipal_id');
            $table->ulid('bulk_dispatch_id');
            $table->ulid('bulk_dispatch_line_id');
            $table->ulid('stock_receipt_line_id');
            $table->unsignedInteger('approval_revision');
            $table->string('base_unit', 16);
            $table->decimal('quantity', 15, 3);
            $table->string('status', 20)->default('reserved');
            $table->timestamps();
            $table->unique(['id', 'municipal_id', 'stock_receipt_line_id'], 'gd_bulk_alloc_id_tenant_batch_unique');
            $table->unique(['id', 'municipal_id', 'stock_receipt_line_id', 'base_unit'], 'gd_bulk_alloc_id_tenant_batch_unit_unique');
            $table->unique(['id', 'bulk_dispatch_id', 'municipal_id'], 'gd_bulk_alloc_id_dispatch_tenant_unique');
            $table->unique(['bulk_dispatch_line_id', 'approval_revision', 'stock_receipt_line_id'], 'gd_bulk_alloc_revision_unique');
            $table->index(['stock_receipt_line_id', 'status'], 'gd_bulk_alloc_reserved_idx');
            $table->foreign(['bulk_dispatch_id', 'municipal_id'], 'gd_bulk_alloc_dispatch_fk')->references(['id', 'municipal_id'])->on('gd_bulk_dispatches')->restrictOnDelete();
            $table->foreign(['bulk_dispatch_line_id', 'bulk_dispatch_id', 'municipal_id'], 'gd_bulk_alloc_line_fk')->references(['id', 'bulk_dispatch_id', 'municipal_id'])->on('gd_bulk_dispatch_lines')->restrictOnDelete();
            $table->foreign(['stock_receipt_line_id', 'municipal_id', 'base_unit'], 'gd_bulk_alloc_batch_fk')->references(['id', 'municipal_id', 'base_unit'])->on('gd_stock_receipt_lines')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gd_bulk_dispatch_stock_allocations');
    }
};
