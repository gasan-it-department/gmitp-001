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
        Schema::create('procurement_funding_sources', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name'); // e.g., "20% Development Fund 2026"
            $table->string('code')->nullable(); // e.g., "GF-01"
            $table->string('type'); // e.g., "General", "Special", "Grant"
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('procurement_funding_sources');
    }
};
