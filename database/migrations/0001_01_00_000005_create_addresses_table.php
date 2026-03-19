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
        Schema::create('addresses', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignId('psgc_region_id')->nullable()->constrained('psgc_regions');
            $table->foreignId('psgc_province_id')->nullable()->constrained('psgc_provinces');
            $table->foreignId('psgc_municipality_id')->nullable()->constrained('psgc_municipalities');
            $table->foreignId('psgc_barangay_id')->nullable()->constrained('psgc_barangays');
            $table->json('address_snapshot')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('addresses');
    }
};
