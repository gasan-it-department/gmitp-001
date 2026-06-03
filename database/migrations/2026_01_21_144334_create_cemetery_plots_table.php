<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('cemetery_plots', function (Blueprint $table) {
            $table->ulid('id')->primary();

            // Tenant boundary (SR-1).
            $table->foreignUlid('municipal_id')
                ->constrained('municipalities')
                ->restrictOnDelete();

            // New hierarchy: plot belongs to a block (not directly to a section).
            $table->foreignUlid('block_id')
                ->constrained('cemetery_blocks')
                ->restrictOnDelete();

            // Self-referencing parent/child discriminator.
            //   NULL → this row is a container (parent) OR a single-capacity plot.
            //   SET  → this row is a slot inside the referenced parent (leaf).
            //   Interments may ONLY attach to leaves — guard at the Action layer
            //   (BR-4); DB cannot enforce "leaf-only" without triggers.
            $table->ulid('parent_plot_id')->nullable()->index();

            // Identifier (e.g. "APARTMENT A-12"). UPPERCASE at the DTO layer.
            // Children INHERIT the parent's name; the Plot::slotLabel() accessor
            // composes the per-slot label (e.g. "A-12-L3").
            $table->string('name');

            // lawn_lot | apartment_niche | bone_ossuary | mausoleum
            $table->string('type');

            // available | occupied | reserved | maintenance — NULLABLE because
            // the parent/container row has no meaningful status (not bookable).
            $table->string('status')->nullable();

            // Spatial locators — REQ-2.1 (Row + Level explicit; position is an
            // optional grid hint, e.g. LEFT/RIGHT/TOP/BOTTOM).
            $table->string('row')->nullable();
            $table->unsignedSmallInteger('level')->nullable();
            $table->string('position')->nullable();

            // Parent capacity = admin-set (1..N). Slot capacity = 1.
            $table->unsignedInteger('capacity');

            $table->timestamps();
            $table->softDeletes(); // REQ-4.3 / SR-4

            // Spatial collision guard — composite uniqueness per the task spec.
            // Note: in MySQL, NULLs are distinct, so two parent rows (all
            // spatial cols NULL) with different names coexist — intended.
            $table->unique(
                ['municipal_id', 'block_id', 'row', 'name', 'level', 'position'],
                'cemetery_plots_spatial_unique'
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
