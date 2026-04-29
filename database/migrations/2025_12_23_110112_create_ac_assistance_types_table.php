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
        Schema::create('ac_assistance_types', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->foreignUlid('municipal_id')
                ->constrained('municipalities')
                ->cascadeOnDelete();

            $table->string('name');
            $table->text('description')->nullable();

            $table->boolean('is_active')->default(true);

            $table->json('required_documents')->nullable();

            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ac_assistance_types');
    }
};
