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
        Schema::create('ac_household_members', function (Blueprint $table) {

            $table->ulid('id')->primary();

            $table->foreignUlid('household_id')
                ->constrained('ac_households')
                ->cascadeOnDelete();

            $table->string('first_name');

            $table->string('last_name');

            $table->string('middle_name')->nullable();

            $table->string('suffix')->nullable();

            $table->date('birth_date')->nullable();

            $table->string('sex')->nullable();

            $table->string('relationship')->nullable();

            $table->string('civil_status')->nullable();
            $table->string('occupation')->nullable();
            // Storing income as decimal: 10 digits total, 2 decimal places (e.g., 99999999.99)
            $table->decimal('monthly_income', 10, 2)->default(0);

            $table->softDeletes();
            $table->timestamps();

            $table->index(['first_name', 'last_name', 'birth_date']);

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ac_household_members');
    }
};
