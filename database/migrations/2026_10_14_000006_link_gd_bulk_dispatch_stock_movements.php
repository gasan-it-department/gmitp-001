<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('gd_stock_movements', function (Blueprint $table): void {
            $table->foreign(['bulk_dispatch_stock_allocation_id', 'municipal_id', 'stock_receipt_line_id'], 'gd_movements_bulk_alloc_fk')->references(['id', 'municipal_id', 'stock_receipt_line_id'])->on('gd_bulk_dispatch_stock_allocations')->restrictOnDelete();
            $table->foreign(['bulk_dispatch_reconciliation_line_id', 'municipal_id', 'stock_receipt_line_id', 'base_unit'], 'gd_movements_bulk_recon_fk')->references(['id', 'municipal_id', 'stock_receipt_line_id', 'base_unit'])->on('gd_bulk_dispatch_reconciliation_lines')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('gd_stock_movements', function (Blueprint $table): void {
            $table->dropForeign('gd_movements_bulk_alloc_fk');
            $table->dropForeign('gd_movements_bulk_recon_fk');
        });
    }
};
