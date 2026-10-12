<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gd_stock_receipts', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->ulid('municipal_id');
            $table->string('receipt_number', 60);
            $table->string('kind', 24)->default('receipt');
            $table->string('status', 24)->default('draft');
            $table->ulid('stock_source_id');
            $table->ulid('storage_location_id');
            $table->date('received_on');
            $table->string('reference', 150)->nullable();
            $table->text('notes')->nullable();
            $table->string('source_name_snapshot');
            $table->string('storage_location_name_snapshot');
            $table->ulid('received_by_user_id')->nullable();
            $table->ulid('created_by_user_id')->nullable();
            $table->ulid('posted_by_user_id')->nullable();
            $table->timestamp('posted_at')->nullable();
            $table->ulid('voided_by_user_id')->nullable();
            $table->timestamp('voided_at')->nullable();
            $table->text('void_reason')->nullable();
            $table->timestamps();

            $table->foreign('municipal_id')->references('id')->on('municipalities')->restrictOnDelete();
            $table->foreign('received_by_user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('created_by_user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('posted_by_user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('voided_by_user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign(['stock_source_id', 'municipal_id'], 'gd_receipts_source_tenant_fk')
                ->references(['id', 'municipal_id'])->on('gd_stock_sources')->restrictOnDelete();
            $table->foreign(['storage_location_id', 'municipal_id'], 'gd_receipts_location_tenant_fk')
                ->references(['id', 'municipal_id'])->on('gd_storage_locations')->restrictOnDelete();
            $table->unique(['municipal_id', 'receipt_number'], 'gd_receipts_municipal_number_unique');
            $table->unique(['id', 'municipal_id'], 'gd_receipts_id_tenant_unique');
            $table->index(['municipal_id', 'status', 'received_on'], 'gd_receipts_municipal_status_date_idx');
            $table->index(['stock_source_id', 'municipal_id'], 'gd_receipts_source_tenant_idx');
            $table->index(['storage_location_id', 'municipal_id'], 'gd_receipts_location_tenant_idx');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE gd_stock_receipts ADD CONSTRAINT gd_receipts_kind_check CHECK (kind IN ('receipt', 'opening'))");
            DB::statement("ALTER TABLE gd_stock_receipts ADD CONSTRAINT gd_receipts_status_check CHECK (status IN ('draft', 'posted', 'voided'))");
            DB::statement("ALTER TABLE gd_stock_receipts ADD CONSTRAINT gd_receipts_posted_at_check CHECK (status <> 'posted' OR posted_at IS NOT NULL)");
            DB::statement("ALTER TABLE gd_stock_receipts ADD CONSTRAINT gd_receipts_void_details_check CHECK (status <> 'voided' OR (voided_at IS NOT NULL AND void_reason IS NOT NULL AND length(trim(void_reason)) > 0))");
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('gd_stock_receipts');
    }
};
