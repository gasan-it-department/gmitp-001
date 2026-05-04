<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ac_assistance_document_requirements', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->foreignUlid('assistance_type_id')
                ->constrained('ac_assistance_types')
                ->cascadeOnDelete();
            $table->foreignUlid('document_type_id')
                ->constrained('ac_document_types')
                ->cascadeOnDelete();

            $table->boolean('is_required')->default(true);

            $table->timestamps();

            $table->unique(['assistance_type_id', 'document_type_id']);

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ac_assistance_document_requirements');
    }
};
