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
        Schema::create('gov_terms', function (Blueprint $table) {

            $table->ulid('id')->primary();

            $table->foreignUlid('municipal_id')
                ->constrained('municipalities')
                ->restrictOnDelete();

            $table->string('name');

            $table->date('statutory_start');

            $table->date('statutory_end');

            $table->boolean('is_current')->default(false);

            $table->string('slug')->nullable()->index();

            $table->boolean('is_published')->default(false);

            $table->timestamps();

            // $table->unique(['municipal_id', 'name', 'statutory_date', 'statutory_end'], 'unique_term_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gov_terms');
    }
};
