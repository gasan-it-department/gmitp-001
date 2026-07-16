<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cemetery_sections', function (Blueprint $table) {
            $table->ulid('id')->primary();

            // Tenant boundary (SR-1) — every Cemetery table is municipal_id-scoped.
            $table->foreignUlid('municipal_id')
                ->constrained('municipalities')
                ->restrictOnDelete();
            $table->ulid('cemetery_site_id');

            // Identifiers are persisted UPPERCASE at the DTO layer (SR-3).
            $table->string('name');
            $table->text('description')->nullable();

            // active | inactive | maintenance — string column; the model's enum
            // cast (or string compare) is the source of truth (matches Plot's
            // existing string-status pattern).
            $table->string('status')->default('active');

            $table->timestamps();
            $table->softDeletes(); // REQ-4.3

            $table->foreign(
                ['cemetery_site_id', 'municipal_id'],
                'cemetery_sections_site_tenant_foreign'
            )
                ->references(['id', 'municipal_id'])
                ->on('cemetery_sites')
                ->restrictOnDelete();
            $table->unique(['municipal_id', 'cemetery_site_id', 'name']);
            $table->index(
                ['cemetery_site_id', 'municipal_id', 'status'],
                'cemetery_sections_site_tenant_status_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cemetery_sections');
    }
};
