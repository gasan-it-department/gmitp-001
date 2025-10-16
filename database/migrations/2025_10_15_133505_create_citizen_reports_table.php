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
        Schema::create('citizen_reports', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->text('description');
            $table->string('status')->nullable();
            $table->string('province');
            $table->string('municipality');
            $table->string('barangay');
            $table->string('street')->nullable();
            $table->string('file_path');

            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('citizen_reports');
    }
};
