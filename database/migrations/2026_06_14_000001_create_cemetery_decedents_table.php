<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cemetery_decedents', function (Blueprint $table) {
            // 1. Primary & Foreign Keys
            $table->ulid('id')->primary();

            $table->foreignUlid('municipal_id')
                ->constrained('municipalities')
                ->restrictOnDelete();

            $table->foreignId('psgc_municipality_id')
                ->nullable()
                ->constrained('psgc_municipalities')
                ->restrictOnDelete();
            $table->string('psgc_barangay_code', 20)->nullable()->index();
            $table->string('street_name', 150)->nullable();

            // 2. Classification
            $table->string('decedent_type')->default('standard');

            // 3. Personal Identity
            $table->string('first_name', 100)->nullable();
            $table->string('last_name', 100)->nullable();
            $table->string('middle_name', 100)->nullable();
            $table->string('suffix', 20)->nullable();
            $table->string('memorial_name')->nullable();
            $table->string('gender', 20)->nullable();
            $table->date('date_of_birth')->nullable();

            // 4. Death Details
            $table->date('date_of_death')->nullable();
            $table->string('cause_of_death')->nullable();
            $table->string('place_of_death')->nullable();

            // 5. Official Documentation
            $table->date('date_of_registration');
            $table->string('death_certificate_no')->nullable();
            $table->string('reference_document_type')->nullable();
            $table->string('reference_document_number')->nullable();

            // 6. Extras
            $table->text('notes')->nullable();

            // 7. System Tracking
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['last_name', 'first_name']);
        });

        DB::statement('CREATE UNIQUE INDEX cemetery_decedents_death_cert_unique 
               ON cemetery_decedents (municipal_id, death_certificate_no) 
               WHERE death_certificate_no IS NOT NULL AND death_certificate_no != \'\'');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cemetery_decedents');
    }
};
