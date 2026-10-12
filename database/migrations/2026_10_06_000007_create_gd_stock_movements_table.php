<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gd_stock_movements', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->ulid('municipal_id');
            $table->ulid('stock_receipt_line_id');
            $table->string('base_unit', 16);
            $table->string('type', 24);
            $table->string('operation_key', 150);
            // Signed base-unit quantity: positive adds stock, negative removes stock.
            $table->decimal('quantity', 15, 3);
            $table->date('occurred_on');
            $table->timestamp('posted_at');
            $table->ulid('actor_user_id')->nullable();
            $table->text('reason')->nullable();
            $table->string('reference', 150)->nullable();
            $table->ulid('reverses_movement_id')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('municipal_id')->references('id')->on('municipalities')->restrictOnDelete();
            $table->foreign('actor_user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign(['stock_receipt_line_id', 'municipal_id', 'base_unit'], 'gd_movements_line_tenant_unit_fk')
                ->references(['id', 'municipal_id', 'base_unit'])->on('gd_stock_receipt_lines')->restrictOnDelete();
            $table->unique(['municipal_id', 'operation_key'], 'gd_movements_operation_unique');
            $table->unique(['id', 'municipal_id', 'stock_receipt_line_id'], 'gd_movements_id_tenant_line_unique');
            $table->unique('reverses_movement_id', 'gd_movements_reversal_unique');
            $table->index(['stock_receipt_line_id', 'municipal_id', 'base_unit'], 'gd_movements_line_tenant_unit_idx');
            $table->index(['municipal_id', 'posted_at', 'id'], 'gd_movements_municipal_posted_idx');
            $table->index(['municipal_id', 'type', 'occurred_on'], 'gd_movements_municipal_type_date_idx');
        });

        // PostgreSQL needs the referenced unique constraint before the self-reference is added.
        Schema::table('gd_stock_movements', function (Blueprint $table): void {
            $table->foreign(['reverses_movement_id', 'municipal_id', 'stock_receipt_line_id'], 'gd_movements_reversal_tenant_line_fk')
                ->references(['id', 'municipal_id', 'stock_receipt_line_id'])->on('gd_stock_movements')->restrictOnDelete();
        });

        if (in_array(DB::getDriverName(), ['pgsql', 'sqlite'], true)) {
            DB::statement(
                "CREATE UNIQUE INDEX gd_movements_one_receipt_posting
                 ON gd_stock_movements (stock_receipt_line_id)
                 WHERE type IN ('receipt', 'opening')",
            );
        }

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE gd_stock_movements ADD CONSTRAINT gd_movements_quantity_check CHECK (quantity <> 0)');
            DB::statement("ALTER TABLE gd_stock_movements ADD CONSTRAINT gd_movements_piece_quantity_check CHECK (base_unit <> 'piece' OR quantity = trunc(quantity))");
            DB::statement("ALTER TABLE gd_stock_movements ADD CONSTRAINT gd_movements_receipt_quantity_check CHECK (type NOT IN ('receipt', 'opening') OR quantity > 0)");
            DB::statement("ALTER TABLE gd_stock_movements ADD CONSTRAINT gd_movements_reason_check CHECK (type NOT IN ('adjustment', 'reversal') OR (reason IS NOT NULL AND length(trim(reason)) > 0))");
            DB::statement("ALTER TABLE gd_stock_movements ADD CONSTRAINT gd_movements_reversal_check CHECK ((type = 'reversal' AND reverses_movement_id IS NOT NULL AND reverses_movement_id <> id) OR (type <> 'reversal' AND reverses_movement_id IS NULL))");
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('gd_stock_movements');
    }
};
