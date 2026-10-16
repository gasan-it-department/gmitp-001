<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gd_bulk_dispatch_reconciliations', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->ulid('municipal_id');
            $table->ulid('bulk_dispatch_id');
            $table->string('kind', 24);
            $table->date('occurred_on');
            $table->timestamp('posted_at');
            $table->ulid('actor_user_id')->nullable();
            $table->string('operation_key', 100);
            $table->string('reference', 150);
            $table->text('notes')->nullable();
            $table->boolean('usable_confirmed')->default(false);
            $table->ulid('reverses_reconciliation_id')->nullable()->unique();
            $table->timestamp('created_at');
            $table->unique(['municipal_id', 'operation_key'], 'gd_bulk_recon_operation_unique');
            $table->unique(['id', 'bulk_dispatch_id', 'municipal_id'], 'gd_bulk_recon_id_dispatch_tenant_unique');
            $table->foreign(['bulk_dispatch_id', 'municipal_id'], 'gd_bulk_recon_dispatch_fk')->references(['id', 'municipal_id'])->on('gd_bulk_dispatches')->restrictOnDelete();
            $table->foreign('actor_user_id')->references('id')->on('users')->nullOnDelete();
        });
        Schema::table('gd_bulk_dispatch_reconciliations', function (Blueprint $table): void {
            $table->foreign(['reverses_reconciliation_id', 'bulk_dispatch_id', 'municipal_id'], 'gd_bulk_recon_reversal_fk')->references(['id', 'bulk_dispatch_id', 'municipal_id'])->on('gd_bulk_dispatch_reconciliations')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gd_bulk_dispatch_reconciliations');
    }
};
