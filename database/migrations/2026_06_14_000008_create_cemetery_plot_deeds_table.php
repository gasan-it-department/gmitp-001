<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cemetery_plot_leases', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->foreignUlid('municipal_id')
                ->constrained('municipalities')
                ->restrictOnDelete();

            // FK is attached in the interments migration because this file
            // intentionally runs before cemetery_interments in the dev sequence.
            $table->ulid('interment_id');

            $table->foreignUlid('plot_id')
                ->constrained('cemetery_plots')
                ->restrictOnDelete();

            $table->string('leaseholder_name');
            $table->string('leaseholder_contact')->nullable();
            $table->string('leaseholder_address')->nullable();
            $table->string('leaseholder_relationship')->nullable();
            $table->date('lease_start')->nullable();
            $table->date('lease_end')->nullable();
            $table->decimal('amount_paid', 10, 2)->nullable();
            $table->string('or_number')->nullable();
            $table->string('status')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['municipal_id', 'plot_id'], 'cemetery_plot_leases_plot_index');
            $table->unique(['municipal_id', 'interment_id'], 'cemetery_plot_leases_interment_unique');
            $table->index(['municipal_id', 'lease_end'], 'cemetery_plot_leases_lease_end_index');
            $table->unique(['municipal_id', 'or_number'], 'cemetery_plot_leases_or_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cemetery_plot_leases');
    }
};
