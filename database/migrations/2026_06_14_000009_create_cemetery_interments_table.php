<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cemetery_interments', function (Blueprint $table) {
            $table->ulid('id')->primary();

            // Tenant boundary (SR-1).
            $table->foreignUlid('municipal_id')
                ->constrained('municipalities')
                ->restrictOnDelete();

            // The biological entity being interred.
            $table->foreignUlid('decedent_id')
                ->constrained('cemetery_decedents')
                ->restrictOnDelete();

            // The location. MUST point to a LEAF/CHILD plot (BR-4) — i.e. a
            // row whose parent_plot_id is set, OR a single-capacity plot with
            // no children. Enforced by RecordIntermentAction; not a DB
            // constraint (would require a trigger).
            $table->foreignUlid('plot_id')
                ->constrained('cemetery_plots')
                ->restrictOnDelete();

            $table->date('interment_date')->nullable();

            // Event-type model: each row is an interment event.
            //   initial  → first burial at this slot.
            //   transfer → record created by a transfer from another slot.
            // Exhumation = soft-delete this row + flip the slot back to
            // AVAILABLE (handled atomically by the lifecycle Action).
            $table->enum('type', ['initial', 'transfer'])->default('initial')->index();

            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes(); // REQ-4.3

            $table->index(['municipal_id', 'plot_id']);
            $table->index(['municipal_id', 'decedent_id']);
        });

        if (Schema::getConnection()->getDriverName() !== 'sqlite' && Schema::hasTable('cemetery_plot_leases')) {
            Schema::table('cemetery_plot_leases', function (Blueprint $table) {
                $table->foreign('created_from_interment_id', 'cemetery_plot_leases_origin_foreign')
                    ->references('id')
                    ->on('cemetery_interments')
                    ->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'sqlite' && Schema::hasTable('cemetery_plot_leases')) {
            Schema::table('cemetery_plot_leases', function (Blueprint $table) {
                $table->dropForeign('cemetery_plot_leases_origin_foreign');
            });
        }

        Schema::dropIfExists('cemetery_interments');
    }
};
