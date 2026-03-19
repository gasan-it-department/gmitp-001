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
        Schema::create('cemetery_plots', function (Blueprint $table) {

            $table->ulid('id')->primary();

            $table->foreignUlid('municipal_id')
                ->constrained('municipalities')
                ->restrictOnDelete();

            $table->foreignUlid('section_id')
                ->constrained('cemetery_sections')
                ->restrictOnDelete();

            $table->string('plot_number')->nullable();

            $table->string('name')->nullable();

            $table->string('type')->nullable();

            $table->string('status')->nullable();

            $table->unsignedBigInteger('total_capacity')->nullable();

            $table->geometry('coordinates')->nullable();

            $table->timestamps();

            $table->unique(['municipal_id', 'plot_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cemetery_plots');
    }
};
