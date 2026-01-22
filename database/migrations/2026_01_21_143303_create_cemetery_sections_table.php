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
        Schema::create('cemetery_sections', function (Blueprint $table) {

            $table->ulid('id')->primary();

            $table->string('name');

            $table->string('type')->nullable();

            $table->unsignedBigInteger('total_capacity')->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cemetery_sections');
    }
};
