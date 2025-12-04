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

            $table->foreignUlid('municipality_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('home_banner_url')->nullable();

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
