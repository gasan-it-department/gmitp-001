<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cemetery_plot_reservations', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->foreignUlid('municipal_id')
                ->constrained('municipalities')
                ->restrictOnDelete();

            $table->foreignUlid('plot_id')
                ->constrained('cemetery_plots')
                ->restrictOnDelete();

            $table->foreignUlid('decedent_id')
                ->nullable()
                ->constrained('cemetery_decedents')
                ->nullOnDelete();

            $table->foreignUlid('interment_id')
                ->nullable()
                ->constrained('cemetery_interments')
                ->nullOnDelete();

            $table->string('reserved_for_name');
            $table->string('reserved_for_contact')->nullable();
            $table->string('reserved_for_address')->nullable();
            $table->string('relationship_to_decedent')->nullable();
            $table->dateTime('reserved_at');
            $table->dateTime('expires_at')->nullable();
            $table->string('status');
            $table->dateTime('cancelled_at')->nullable();
            $table->foreignUlid('cancelled_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->text('cancellation_reason')->nullable();
            $table->dateTime('converted_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['municipal_id', 'plot_id'], 'cemetery_plot_reservations_plot_index');
            $table->index(['municipal_id', 'decedent_id'], 'cemetery_plot_reservations_decedent_index');
            $table->index(['municipal_id', 'interment_id'], 'cemetery_plot_reservations_interment_index');
            $table->index(['municipal_id', 'status'], 'cemetery_plot_reservations_status_index');
            $table->index(['municipal_id', 'expires_at'], 'cemetery_plot_reservations_expires_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cemetery_plot_reservations');
    }
};
