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
        Schema::create('ac_beneficiaries', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('household_id')
                ->constrained('ac_households')
                ->cascadeOnDelete();

            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->string('suffix')->nullable();
            $table->string('sex')->nullable();
            $table->date('birth_date');

            $table->softDeletes();
            $table->timestamps();

            $table->index(['last_name', 'first_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ac_beneficiaries');
    }
};
