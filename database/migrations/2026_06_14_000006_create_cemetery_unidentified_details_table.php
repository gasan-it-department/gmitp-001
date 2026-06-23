<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cemetery_unidentified_details', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('municipal_id')->constrained('municipalities')->restrictOnDelete();
            $table->foreignUlid('decedent_id')->unique()->constrained('cemetery_decedents')->cascadeOnDelete();
            $table->string('case_reference');
            $table->string('found_location')->nullable();
            $table->date('date_found')->nullable();
            $table->string('reported_by')->nullable();
            $table->string('reporting_agency')->nullable();
            $table->string('estimated_age')->nullable();
            $table->string('estimated_sex', 30)->nullable();
            $table->text('distinguishing_features')->nullable();
            $table->text('physical_description')->nullable();
            $table->boolean('requires_medico_legal')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['municipal_id', 'case_reference'], 'cemetery_unidentified_case_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cemetery_unidentified_details');
    }
};
