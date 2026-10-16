<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gd_bulk_dispatch_lines', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->ulid('municipal_id');
            $table->ulid('bulk_dispatch_id');
            $table->ulid('item_id');
            $table->string('item_name_snapshot');
            $table->string('item_code_snapshot', 50);
            $table->string('base_unit', 16);
            $table->decimal('quantity', 15, 3)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['id', 'bulk_dispatch_id', 'municipal_id'], 'gd_bulk_lines_id_dispatch_tenant_unique');
            $table->foreign(['bulk_dispatch_id', 'municipal_id'], 'gd_bulk_lines_dispatch_fk')->references(['id', 'municipal_id'])->on('gd_bulk_dispatches')->restrictOnDelete();
            $table->foreign(['item_id', 'municipal_id'], 'gd_bulk_lines_item_fk')->references(['id', 'municipal_id'])->on('gd_items')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gd_bulk_dispatch_lines');
    }
};
