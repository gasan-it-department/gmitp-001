<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gd_programs', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->ulid('municipal_id');
            $table->string('code', 50);
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('cooldown_enabled')->default(false);
            $table->string('cooldown_scope', 20)->default('household');
            $table->unsignedInteger('cooldown_duration')->nullable();
            $table->string('cooldown_unit', 10)->nullable();
            $table->timestamps();

            $table->foreign('municipal_id')->references('id')->on('municipalities')->restrictOnDelete();
            $table->unique(['municipal_id', 'code'], 'gd_programs_municipal_code_unique');
            $table->unique(['id', 'municipal_id'], 'gd_programs_id_tenant_unique');
            $table->index(['municipal_id', 'is_active', 'name'], 'gd_programs_municipal_active_name_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gd_programs');
    }
};
