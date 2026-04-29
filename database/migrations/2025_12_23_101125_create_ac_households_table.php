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
        Schema::create('ac_households', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->foreignUlid('municipal_id')
                ->constrained('municipalities')
                ->restrictOnDelete();

            // A generated reference code for MSWD (e.g., GASAN-HH-26-0001)
            $table->string('household_code')->unique()->nullable();

            $table->string('province')->default('MARINDUQUE');
            $table->string('municipality');
            $table->string('barangay');
            $table->string('street')->nullable();

            $table->softDeletes();
            $table->timestamps();

            // 🚀 Performance Optimization
            // Index for the auto-matcher and fast dashboard filtering
            $table->index(['municipal_id', 'barangay', 'street']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ac_households');
    }
};
