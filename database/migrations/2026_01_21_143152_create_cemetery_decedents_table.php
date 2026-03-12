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
        Schema::create('cemetery_decedents', function (Blueprint $table) {

            $table->ulid('id')->primary();

            $table->foreignUlid('municipal_id')
                ->constrained('municipalities')
                ->restrictOnDelete();

            $table->string('first_name');

            $table->string('last_name')->index();

            $table->string('middle_name')->nullable();

            $table->string('suffix')->nullable();

            $table->date('date_of_birth')->nullable();

            $table->date('date_of_death')->nullable();

            $table->string('gender')->nullable();

            $table->string('cause_of_death')->nullable();

            $table->string('death_certificate_no')->nullable()->unique();

            $table->text('notes')->nullable();

            $table->timestamps();

            $table->softDeletes();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cemetery_decedents');
    }
};
