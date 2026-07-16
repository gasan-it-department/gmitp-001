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

            $table->ulid('previous_interment_id')->nullable();
            $table->date('interment_date')->nullable();

            // Event-type model: each row is an interment event.
            //   initial  → first burial at this slot.
            //   transfer → record created by a transfer from another slot.
            // Normal movement ends a row with ended_at/end_reason instead of
            // soft deletion so the cemetery history remains queryable.
            $table->enum('type', ['initial', 'transfer'])->default('initial')->index();

            $table->text('notes')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->ulid('ended_by')->nullable();
            $table->enum('end_type', ['moved', 'exhumed', 'transferred_out'])->nullable()->index();
            $table->string('end_reason')->nullable();
            $table->text('end_notes')->nullable();
            $table->string('transfer_destination')->nullable();
            $table->string('permit_reference')->nullable();
            $table->timestamp('voided_at')->nullable();
            $table->ulid('voided_by')->nullable();
            $table->text('void_reason')->nullable();

            $table->timestamps();
            $table->softDeletes(); // REQ-4.3

            $table->index(['municipal_id', 'plot_id']);
            $table->index(['municipal_id', 'decedent_id']);
            $table->index(['municipal_id', 'ended_at', 'voided_at'], 'cemetery_interments_active_index');
        });

        if (Schema::getConnection()->getDriverName() !== 'sqlite') {
            Schema::table('cemetery_interments', function (Blueprint $table) {
                $table->foreign('previous_interment_id', 'cemetery_interments_previous_foreign')
                    ->references('id')
                    ->on('cemetery_interments')
                    ->nullOnDelete();
            });
        }

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
        if (Schema::getConnection()->getDriverName() !== 'sqlite' && Schema::hasTable('cemetery_interments')) {
            Schema::table('cemetery_interments', function (Blueprint $table) {
                $table->dropForeign('cemetery_interments_previous_foreign');
            });
        }

        if (Schema::getConnection()->getDriverName() !== 'sqlite' && Schema::hasTable('cemetery_plot_leases')) {
            Schema::table('cemetery_plot_leases', function (Blueprint $table) {
                $table->dropForeign('cemetery_plot_leases_origin_foreign');
            });
        }

        Schema::dropIfExists('cemetery_interments');
    }
};
