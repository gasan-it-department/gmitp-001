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
        Schema::create('tourism_events', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->foreignUlid('municipal_id')->constrained('municipalities')->cascadeOnDelete();

            $table->foreignUlid('category_id')->constrained('tourism_categories')->restrictOnDelete();

            $table->string('name');

            $table->string('slug');

            $table->text('description');

            $table->dateTime('start_date');

            $table->dateTime('end_date');


            $table->string('location_name'); // e.g., "Boac Town Plaza"
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->decimal('entrance_fee', 10, 2)->default(0);
            $table->boolean('is_published')->default(false);

            $table->timestamps();
            $table->index(['municipal_id', 'start_date', 'is_published']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tourism_events');
    }
};
