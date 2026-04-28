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
        Schema::create('tourism_assets', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->foreignUlid('municipal_id')->constrained('municipalities')->cascadeOnDelete();

            $table->foreignUlid('category_id')->constrained('tourism_categories');

            $table->string('type')->index();

            $table->string('name');
            $table->string('slug');
            $table->text('short_description');
            $table->longText('description')->nullable();
            $table->boolean('is_published')->default(false);

            $table->jsonb('meta')->nullable();

            $table->timestamps();

            $table->unique(['municipal_id', 'slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tourism_assets');
    }
};
