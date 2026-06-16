<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('cemetery_sections', function (Blueprint $table) {
            $table->ulid('id')->primary();

            // Tenant boundary (SR-1) — every Cemetery table is municipal_id-scoped.
            $table->foreignUlid('municipal_id')
                ->constrained('municipalities')
                ->restrictOnDelete();

            // Identifiers are persisted UPPERCASE at the DTO layer (SR-3).
            $table->string('name');
            $table->text('description')->nullable();

            // active | inactive | maintenance — string column; the model's enum
            // cast (or string compare) is the source of truth (matches Plot's
            // existing string-status pattern).
            $table->string('status')->default('active')->index();

            $table->timestamps();
            $table->softDeletes(); // REQ-4.3

            $table->unique(['municipal_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cemetery_sections');
    }
};
