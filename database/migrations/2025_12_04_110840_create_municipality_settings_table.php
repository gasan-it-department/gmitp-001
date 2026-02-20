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

            $table->foreignUlid('municipal_id')
                ->constrained('municipalities')
                ->cascadeOnDelete();

            $table->foreignUlid('user_id')
                ->constrained('users')
                ->nullOnDelete();

            $table->string('logo_public_id')->nullable();

            $table->string('logo_secure_url')->nullable();

            $table->timestamps();
        });

        Schema::create('municipality_banners', function (Blueprint $table) {

            $table->ulid('id')->primary();

            $table->foreignUlid('municipal_id')
                ->constrained('municipalities')
                ->cascadeOnDelete();

            $table->foreignUlid('user_id')
                ->constrained('users')
                ->nullOnDelete();

            $table->string('public_id');

            $table->string('position')->nullable();

            $table->timestamps();
        });



    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {

        Schema::dropIfExists('municipality_settings');

        Schema::dropIfExists('municipality_banners');


    }
};
