<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gd_program_document_requirements', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->ulid('municipal_id');
            $table->ulid('program_id');
            $table->ulid('document_type_id');
            $table->boolean('is_required')->default(true);
            $table->string('evidence_mode', 24)->default('physical');
            $table->string('physical_copy_requirement', 40)->default('unspecified');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->unique(['program_id', 'document_type_id'], 'gd_program_documents_unique');
            $table->foreign(['program_id', 'municipal_id'], 'gd_program_documents_tenant_fk')->references(['id', 'municipal_id'])->on('gd_programs')->restrictOnDelete();
            foreach (['municipal_id' => 'municipalities', 'document_type_id' => 'ac_document_types'] as $column => $target) {
                $table->foreign($column)->references('id')->on($target)->restrictOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gd_program_document_requirements');
    }
};
