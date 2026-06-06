<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('cemetery_blocks', function (Blueprint $table) {
            $table->ulid('id')->primary();

            // Tenant boundary (SR-1).
            $table->foreignUlid('municipal_id')
                ->constrained('municipalities')
                ->restrictOnDelete();

            // Block belongs to a section; restrictOnDelete preserves history.
            $table->foreignUlid('section_id')
                ->constrained('cemetery_sections')
                ->restrictOnDelete();

            // Block name / code (e.g. "B-04"). UPPERCASE at the DTO layer.
            $table->string('name');

            // active | inactive | maintenance — same convention as sections.
            $table->string('status')->default('active')->index();

            $table->timestamps();
            $table->softDeletes(); // REQ-4.3

            // Block names are unique within a section, per tenant.
            $table->unique(['municipal_id', 'section_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cemetery_blocks');
    }
};
