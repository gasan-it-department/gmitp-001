<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gd_program_items', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->ulid('municipal_id');
            $table->ulid('program_id');
            $table->ulid('item_id');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('municipal_id')->references('id')->on('municipalities')->restrictOnDelete();
            $table->foreign(['program_id', 'municipal_id'], 'gd_program_items_program_tenant_fk')
                ->references(['id', 'municipal_id'])->on('gd_programs')->restrictOnDelete();
            $table->foreign(['item_id', 'municipal_id'], 'gd_program_items_item_tenant_fk')
                ->references(['id', 'municipal_id'])->on('gd_items')->restrictOnDelete();
            $table->unique(['municipal_id', 'program_id', 'item_id'], 'gd_program_items_membership_unique');
            $table->index(['municipal_id', 'program_id', 'is_active'], 'gd_program_items_program_active_idx');
            $table->index(['item_id', 'municipal_id'], 'gd_program_items_item_tenant_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gd_program_items');
    }
};
