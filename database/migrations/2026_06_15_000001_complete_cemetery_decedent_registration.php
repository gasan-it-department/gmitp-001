<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cemetery_decedents', function (Blueprint $table) {
            $table->string('vital_record_type')->default('death')->after('decedent_type')->index();
            $table->string('identity_status')->default('identified')->after('vital_record_type')->index();
            $table->string('registration_status')->default('draft')->after('identity_status')->index();
            $table->boolean('has_legal_name')->default(true)->after('registration_status');
            $table->string('registry_number')->nullable()->after('death_certificate_no');
            $table->timestamp('submitted_at')->nullable()->after('date_of_registration');
            $table->foreignUlid('submitted_by')->nullable()->after('submitted_at')->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable()->after('submitted_by');
            $table->foreignUlid('verified_by')->nullable()->after('verified_at')->constrained('users')->nullOnDelete();
            $table->unsignedInteger('version')->default(1)->after('verified_by');

            $table->unique(
                ['municipal_id', 'vital_record_type', 'registry_number'],
                'cemetery_decedents_registry_unique'
            );
        });

        DB::table('cemetery_decedents')
            ->whereIn('decedent_type', ['standard', 'child'])
            ->update([
                'vital_record_type' => 'death',
                'identity_status' => 'identified',
                'registration_status' => 'pending_review',
                'has_legal_name' => true,
            ]);

        DB::table('cemetery_decedents')
            ->where('decedent_type', 'fetal')
            ->update([
                'vital_record_type' => 'fetal_death',
                'identity_status' => 'identified',
                'registration_status' => 'pending_review',
                'has_legal_name' => false,
            ]);

        DB::table('cemetery_decedents')
            ->where('decedent_type', 'unknown')
            ->update([
                'vital_record_type' => 'death',
                'identity_status' => 'unidentified',
                'registration_status' => 'pending_review',
                'has_legal_name' => false,
            ]);

        DB::table('cemetery_decedents')
            ->whereNotNull('death_certificate_no')
            ->whereNull('registry_number')
            ->update(['registry_number' => DB::raw('death_certificate_no')]);
    }

    public function down(): void
    {
        Schema::table('cemetery_decedents', function (Blueprint $table) {
            $table->dropUnique('cemetery_decedents_registry_unique');
            $table->dropConstrainedForeignId('verified_by');
            $table->dropConstrainedForeignId('submitted_by');
            $table->dropColumn([
                'vital_record_type',
                'identity_status',
                'registration_status',
                'has_legal_name',
                'registry_number',
                'submitted_at',
                'verified_at',
                'version',
            ]);
        });
    }
};
