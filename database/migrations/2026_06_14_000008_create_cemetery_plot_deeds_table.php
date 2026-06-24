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
        Schema::create('cemetery_plot_deeds', function (Blueprint $table) {

            $table->ulid('id')->primary();

            $table->foreignUlid('plot_id')
                ->constrained('cemetery_plots')
                ->restrictOnDelete();

            $table->string('owner_name');

            $table->string('owner_contact')->nullable();

            $table->string('owner_address')->nullable();

            $table->date('lease_start')->nullable();

            $table->date('lease_end')->nullable();

            $table->decimal('amount_paid', 10, 2)->nullable();

            $table->string('or_number')->nullable();

            $table->string('status')->nullable();

            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cemetery_plot_deeds');
    }
};
