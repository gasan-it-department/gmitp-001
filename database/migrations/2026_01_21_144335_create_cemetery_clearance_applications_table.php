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
        Schema::create('cemetery_clearance_applications', function (Blueprint $table) {

            $table->ulid('id')->primary();

            $table->foreignUlid('plot_id')
                ->constrained('cemetery_plots')
                ->restrictOnDelete();

            $table->string('requesting_part_name');

            $table->string('requesting_party_address');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cemetery_clearance_applications');
    }
};
