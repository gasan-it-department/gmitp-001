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
        Schema::create('official_terms', function (Blueprint $table) {

            $table->ulid('id')->primary();


            $table->foreignUlid('municipal_id')
                ->constrained('municipalities')
                ->restrictOnDelete();

            $table->foreignUlid('term_id')
                ->constrained('terms')
                ->cascadeOnDelete();

            $table->foreignUlid('official_id')
                ->constrained('officials')
                ->cascadeOnDelete();

            $table->foreignUlid('position_id')
                ->constrained('positions')
                ->restrictOnDelete();

            $table->date('actual_start_date');

            $table->date('actual_end_date')->nullable();

            $table->string('status')->nullable();

            $table->string('political_party')->nullable();

            $table->string('profile_url')->nullable();

            $table->string('profile_public_id')->nullable();

            $table->timestamps();

            $table->unique(['term_id', 'official_id'], 'one_position_per_term');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('official_terms');
    }
};
