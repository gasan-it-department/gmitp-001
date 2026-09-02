<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ac_assistance_types', function (Blueprint $table): void {
            $table->json('enabled_generated_documents')
                ->nullable()
                ->after('sort_order');
        });

        DB::table('ac_assistance_types')
            ->whereNull('enabled_generated_documents')
            ->update([
                'enabled_generated_documents' => json_encode([
                    'request_intake_sheet',
                    'certificate_of_eligibility',
                    'obligation_request',
                    'disbursement_voucher',
                    'acknowledgement_receipt',
                ], JSON_THROW_ON_ERROR),
            ]);
    }

    public function down(): void
    {
        Schema::table('ac_assistance_types', function (Blueprint $table): void {
            $table->dropColumn('enabled_generated_documents');
        });
    }
};
