<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cemetery_unidentified_details', function (Blueprint $table) {
            $table->foreignUlid('municipal_id')->nullable()->after('id')->constrained('municipalities')->restrictOnDelete();
            $table->string('case_reference')->nullable()->after('decedent_id');
            $table->string('reporting_agency')->nullable()->after('reported_by');
            $table->string('estimated_sex', 30)->nullable()->after('estimated_age');
            $table->text('distinguishing_features')->nullable()->after('estimated_sex');
            $table->text('physical_description')->nullable()->after('distinguishing_features');
            $table->boolean('requires_medico_legal')->default(true)->after('physical_description');
            $table->softDeletes();
            $table->unique(['municipal_id', 'case_reference'], 'cemetery_unidentified_case_unique');
        });

        $rows = DB::table('cemetery_unidentified_details')->get(['id', 'decedent_id', 'reference_code']);
        foreach ($rows as $row) {
            $municipalId = DB::table('cemetery_decedents')->where('id', $row->decedent_id)->value('municipal_id');
            DB::table('cemetery_unidentified_details')->where('id', $row->id)->update([
                'municipal_id' => $municipalId,
                'case_reference' => $row->reference_code,
            ]);
        }

        Schema::table('cemetery_unidentified_details', function (Blueprint $table) {
            $table->ulid('municipal_id')->nullable(false)->change();
            $table->string('case_reference')->nullable(false)->change();
        });

        Schema::create('cemetery_fetal_death_details', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('municipal_id')->constrained('municipalities')->restrictOnDelete();
            $table->foreignUlid('decedent_id')->unique()->constrained('cemetery_decedents')->cascadeOnDelete();
            $table->unsignedSmallInteger('gestational_age_weeks')->nullable();
            $table->unsignedInteger('fetal_weight_grams')->nullable();
            $table->string('mother_name')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cemetery_fetal_death_details');

        Schema::table('cemetery_unidentified_details', function (Blueprint $table) {
            $table->dropUnique('cemetery_unidentified_case_unique');
            $table->dropConstrainedForeignId('municipal_id');
            $table->dropSoftDeletes();
            $table->dropColumn([
                'case_reference',
                'reporting_agency',
                'estimated_sex',
                'distinguishing_features',
                'physical_description',
                'requires_medico_legal',
            ]);
        });
    }
};
