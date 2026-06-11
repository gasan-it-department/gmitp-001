<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ac_assistance_request_snapshots', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->foreignUlid('assistance_request_id')
                ->unique()
                ->constrained('ac_assistance_requests')
                ->cascadeOnDelete();

            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->string('suffix')->nullable();
            $table->string('sex')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('educational_attainment')->nullable();
            $table->string('religion')->nullable();
            $table->string('civil_status')->nullable();
            $table->string('occupation')->nullable();
            $table->decimal('monthly_income', 10, 2)->nullable();
            $table->decimal('household_total_income', 10, 2)->nullable();
            $table->string('barangay')->nullable();
            $table->string('barangay_psgc_code')->nullable();
            $table->string('street')->nullable();

            $table->timestamps();

            $table->index(
                ['last_name', 'first_name', 'birth_date'],
                'ac_assistance_request_snapshots_name_idx',
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ac_assistance_request_snapshots');
    }
};
