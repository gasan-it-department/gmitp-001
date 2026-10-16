<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('gd_stock_movements', function (Blueprint $table): void {
            $table->ulid('distribution_stock_allocation_id')->nullable();
            $table->unique('distribution_stock_allocation_id', 'gd_movements_allocation_unique');
            $table->foreign(['distribution_stock_allocation_id', 'municipal_id', 'stock_receipt_line_id'], 'gd_movements_allocation_fk')
                ->references(['id', 'municipal_id', 'stock_receipt_line_id'])->on('gd_distribution_stock_allocations')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('gd_stock_movements', function (Blueprint $table): void {
            $table->dropForeign('gd_movements_allocation_fk');
            $table->dropUnique('gd_movements_allocation_unique');
            $table->dropColumn('distribution_stock_allocation_id');
        });
    }
};
