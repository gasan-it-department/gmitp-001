<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
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
        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE gd_stock_movements ADD CONSTRAINT gd_movements_distribution_check CHECK ((type = 'distribution' AND distribution_stock_allocation_id IS NOT NULL AND quantity < 0) OR (type <> 'distribution' AND distribution_stock_allocation_id IS NULL))");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE gd_stock_movements DROP CONSTRAINT gd_movements_distribution_check');
        }
        Schema::table('gd_stock_movements', function (Blueprint $table): void {
            $table->dropForeign('gd_movements_allocation_fk');
            $table->dropUnique('gd_movements_allocation_unique');
            $table->dropColumn('distribution_stock_allocation_id');
        });
    }
};
