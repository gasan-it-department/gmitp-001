<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cemetery_plots', function (Blueprint $table) {
            $table->ulid('id')->primary();

            // Tenant boundary (SR-1).
            $table->foreignUlid('municipal_id')
                ->constrained('municipalities')
                ->restrictOnDelete();
            $table->ulid('cemetery_site_id');

            // New hierarchy: plot belongs to a block (not directly to a section).
            $table->foreignUlid('block_id')
                ->constrained('cemetery_blocks')
                ->restrictOnDelete();

            // Parent grouping is used only for generated apartment niches.
            // Standard plots keep parent_plot_id NULL even when capacity > 1.
            $table->ulid('parent_plot_id')->nullable()->index();

            // Identifier (e.g. "APARTMENT A-12"). UPPERCASE at the DTO layer.
            // Children INHERIT the parent's name; the Plot::slotLabel() accessor
            // composes the per-slot label (e.g. "A-12-L3").
            $table->string('name');

            // lawn_lot | apartment_niche | bone_ossuary | mausoleum
            $table->string('type');

            // available | occupied | maintenance — NULLABLE because
            // slotted apartment parent rows have no meaningful status.
            $table->string('status')->nullable();

            // single = one decedent; shared = multiple decedents up to capacity;
            // slotted = parent/container row, never directly interred into.
            $table->string('occupancy_mode')->default('single');

            // Spatial locators — REQ-2.1 (Row + Level explicit; position is an
            // optional grid hint, e.g. LEFT/RIGHT/TOP/BOTTOM).
            $table->string('row')->nullable();
            $table->unsignedSmallInteger('level')->nullable();
            $table->string('position')->nullable();

            // Assignable row capacity = maximum decedents/remains. Slotted
            // parent capacity summarizes generated child niche count.
            $table->unsignedInteger('capacity');

            // External lot area for standard physical plots. Apartment niches
            // use floor/row/niche locators instead of square-meter tracking.
            $table->decimal('area_sqm', 8, 2)->nullable();

            $table->timestamps();
            $table->softDeletes(); // REQ-4.3 / SR-4

            $table->foreign(
                ['cemetery_site_id', 'municipal_id'],
                'cemetery_plots_site_tenant_foreign'
            )
                ->references(['id', 'municipal_id'])
                ->on('cemetery_sites')
                ->restrictOnDelete();

            // Spatial collision guard — composite uniqueness per the task spec.
            // Note: in MySQL, NULLs are distinct, so two parent rows (all
            // spatial cols NULL) with different names coexist — intended.
            $table->unique(
                ['municipal_id', 'block_id', 'row', 'name', 'level', 'position'],
                'cemetery_plots_spatial_unique'
            );
            $table->index(
                ['cemetery_site_id', 'municipal_id', 'status'],
                'cemetery_plots_site_tenant_status_index'
            );
        });

        // ADD THE FOREIGN KEY IN A SEPARATE BLOCK AFTER THE CREATE (Fix for PostgreSQL)
        Schema::table('cemetery_plots', function (Blueprint $table) {
            $table->foreign('parent_plot_id')
                ->references('id')
                ->on('cemetery_plots')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cemetery_plots');
    }
};
