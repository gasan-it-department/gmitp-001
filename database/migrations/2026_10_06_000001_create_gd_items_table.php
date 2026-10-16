<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gd_items', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->ulid('municipal_id');
            $table->string('code', 50);
            $table->string('name');
            $table->string('category', 50)->nullable();
            $table->text('description')->nullable();
            $table->string('base_unit', 16);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('municipal_id')->references('id')->on('municipalities')->restrictOnDelete();
            $table->unique(['municipal_id', 'code'], 'gd_items_municipal_code_unique');
            $table->unique(['id', 'municipal_id'], 'gd_items_id_tenant_unique');
            $table->unique(['id', 'municipal_id', 'base_unit'], 'gd_items_id_tenant_unit_unique');
            $table->index(['municipal_id', 'is_active', 'name'], 'gd_items_municipal_active_name_idx');
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('gd_items');
    }
};
