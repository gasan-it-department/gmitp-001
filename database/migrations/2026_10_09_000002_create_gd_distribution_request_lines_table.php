<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gd_distribution_request_lines', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->ulid('municipal_id');
            $table->ulid('distribution_request_id');
            $table->ulid('item_id');
            $table->string('item_name_snapshot');
            $table->string('item_code_snapshot', 50);
            $table->string('base_unit', 16);
            $table->decimal('quantity', 15, 3)->nullable();
            $table->unsignedInteger('sort_order');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['distribution_request_id', 'item_id'], 'gd_request_lines_item_unique');
            $table->unique(['id', 'municipal_id'], 'gd_request_lines_id_tenant_unique');
            $table->unique(['id', 'distribution_request_id', 'municipal_id'], 'gd_request_lines_parent_unique');
            $table->foreign(['distribution_request_id', 'municipal_id'], 'gd_request_lines_request_fk')->references(['id', 'municipal_id'])->on('gd_distribution_requests')->restrictOnDelete();
            $table->foreign(['item_id', 'municipal_id'], 'gd_request_lines_item_tenant_fk')->references(['id', 'municipal_id'])->on('gd_items')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gd_distribution_request_lines');
    }
};
