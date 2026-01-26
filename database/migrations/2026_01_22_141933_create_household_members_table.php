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
        Schema::create('household_members', function (Blueprint $table) {

            $table->ulid('id')->primary();

            $table->foreignUlid('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('first_name');

            $table->string('last_name');

            $table->string('middle_name')->nullable();

            $table->string('suffix')->nullable();

            $table->date('birth_date');

            $table->string('relationship')->nullable();

            $table->string('province');

            $table->string('municipality');

            $table->string('barangay');

            $table->string('purok')->nullable();

            $table->string('street_address')->nullable();

            $table->timestamps();

            $table->index(['first_name', 'last_name', 'birth_date']);

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('household_members');
    }
};
