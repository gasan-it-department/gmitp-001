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
        Schema::create('cemetery_unidentified_details', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('decedent_id')
                ->unique()
                ->constrained('cemetery_decedents')
                ->cascadeOnDelete();

            $table->string('reference_code')->unique();

            $table->string('found_location')->nullable();

            $table->date('date_found')->nullable();

            $table->string('reported_by')->nullable();

            $table->string('estimated_age')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cemetery_unidentified_details');
    }
};
