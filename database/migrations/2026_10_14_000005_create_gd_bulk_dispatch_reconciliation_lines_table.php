<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gd_bulk_dispatch_reconciliation_lines', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->ulid('municipal_id');
            $table->ulid('bulk_dispatch_id');
            $table->ulid('reconciliation_id');
            $table->ulid('bulk_dispatch_stock_allocation_id');
            $table->ulid('stock_receipt_line_id');
            $table->string('base_unit', 16);
            $table->decimal('quantity', 15, 3);
            $table->timestamp('created_at');
            $table->unique(['reconciliation_id', 'bulk_dispatch_stock_allocation_id'], 'gd_bulk_recon_line_allocation_unique');
            $table->unique(['id', 'municipal_id'], 'gd_bulk_recon_line_id_tenant_unique');
            $table->unique(['id', 'municipal_id', 'stock_receipt_line_id', 'base_unit'], 'gd_bulk_recon_line_batch_unit_unique');
            $table->foreign(['reconciliation_id', 'bulk_dispatch_id', 'municipal_id'], 'gd_bulk_recon_line_header_fk')->references(['id', 'bulk_dispatch_id', 'municipal_id'])->on('gd_bulk_dispatch_reconciliations')->restrictOnDelete();
            $table->foreign(['bulk_dispatch_stock_allocation_id', 'bulk_dispatch_id', 'municipal_id'], 'gd_bulk_recon_line_allocation_fk')->references(['id', 'bulk_dispatch_id', 'municipal_id'])->on('gd_bulk_dispatch_stock_allocations')->restrictOnDelete();
            $table->foreign(['bulk_dispatch_stock_allocation_id', 'municipal_id', 'stock_receipt_line_id', 'base_unit'], 'gd_bulk_recon_line_batch_unit_fk')->references(['id', 'municipal_id', 'stock_receipt_line_id', 'base_unit'])->on('gd_bulk_dispatch_stock_allocations')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gd_bulk_dispatch_reconciliation_lines');
    }
};
