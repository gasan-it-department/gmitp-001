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
        Schema::create('municipality_settings', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->foreignUlid('municipal_id')->constrained('municipalities')->cascadeOnDelete();
            $table->string('primary_color_hex')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('trunkline_phone')->nullable();
            $table->string('office_hours')->nullable();
            $table->string('facebook_url')->nullable();

            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {

        Schema::dropIfExists('municipality_settings');

    }
};
