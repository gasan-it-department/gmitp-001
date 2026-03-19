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
        Schema::create('psgc_municipalities', function (Blueprint $table) {
            $table->id();

            $table->foreignId('region_id')->constrained('psgc_regions')->restrictOnDelete();
            $table->foreignId('province_id')->nullable()->constrained('psgc_provinces')->restrictOnDelete();

            $table->string('psgc_code', 20)->unique();
            $table->string('name');

            $table->boolean('is_city')->default(false);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('psgc_municipalities');
    }
};
