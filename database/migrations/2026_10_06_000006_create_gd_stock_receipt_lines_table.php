<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gd_stock_receipt_lines', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->ulid('municipal_id');
            $table->ulid('stock_receipt_id');
            $table->unsignedSmallInteger('line_number');
            $table->ulid('item_id');
            $table->ulid('program_id')->nullable();
            $table->string('item_name_snapshot');
            $table->string('program_name_snapshot')->nullable();
            $table->string('base_unit', 16);
            $table->decimal('quantity', 15, 3);
            $table->string('package_type', 24)->nullable();
            $table->unsignedInteger('package_count')->nullable();
            $table->decimal('quantity_per_package', 15, 3)->nullable();
            $table->string('batch_reference', 100)->nullable();
            $table->date('expires_on')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('municipal_id')->references('id')->on('municipalities')->restrictOnDelete();
            // Each line identifies a stock batch; movements retain its source and program through the receipt.
            $table->foreign(['stock_receipt_id', 'municipal_id'], 'gd_lines_receipt_tenant_fk')
                ->references(['id', 'municipal_id'])->on('gd_stock_receipts')->restrictOnDelete();
            $table->foreign(['item_id', 'municipal_id', 'base_unit'], 'gd_lines_item_tenant_unit_fk')
                ->references(['id', 'municipal_id', 'base_unit'])->on('gd_items')->restrictOnDelete();
            $table->foreign(['program_id', 'municipal_id'], 'gd_lines_program_tenant_fk')
                ->references(['id', 'municipal_id'])->on('gd_programs')->restrictOnDelete();
            $table->unique(['stock_receipt_id', 'line_number'], 'gd_lines_receipt_number_unique');
            $table->unique(['id', 'municipal_id', 'base_unit'], 'gd_lines_id_tenant_unit_unique');
            $table->index(['stock_receipt_id', 'municipal_id'], 'gd_lines_receipt_tenant_idx');
            $table->index(['item_id', 'municipal_id', 'base_unit'], 'gd_lines_item_tenant_unit_idx');
            $table->index(['program_id', 'municipal_id'], 'gd_lines_program_tenant_idx');
            $table->index(['municipal_id', 'expires_on'], 'gd_lines_municipal_expiry_idx');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE gd_stock_receipt_lines ADD CONSTRAINT gd_lines_quantity_check CHECK (quantity > 0)');
            DB::statement('ALTER TABLE gd_stock_receipt_lines ADD CONSTRAINT gd_lines_number_check CHECK (line_number > 0)');
            DB::statement("ALTER TABLE gd_stock_receipt_lines ADD CONSTRAINT gd_lines_piece_quantity_check CHECK (base_unit <> 'piece' OR quantity = trunc(quantity))");
            DB::statement(
                'ALTER TABLE gd_stock_receipt_lines ADD CONSTRAINT gd_lines_packaging_check CHECK (
                    (package_type IS NULL AND package_count IS NULL AND quantity_per_package IS NULL)
                    OR (package_type IS NOT NULL AND package_count IS NOT NULL AND quantity_per_package IS NOT NULL
                        AND length(trim(package_type)) > 0 AND package_count > 0 AND quantity_per_package > 0
                        AND quantity = package_count * quantity_per_package)
                )',
            );
            DB::statement("ALTER TABLE gd_stock_receipt_lines ADD CONSTRAINT gd_lines_piece_package_check CHECK (base_unit <> 'piece' OR quantity_per_package IS NULL OR quantity_per_package = trunc(quantity_per_package))");
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('gd_stock_receipt_lines');
    }
};
