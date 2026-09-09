<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ac_assistance_requests', function (Blueprint $table): void {
            $table->string('mswd_verification_status', 32)->nullable()->after('status');
            $table->foreignUlid('mswd_verified_by_user_id')
                ->nullable()
                ->after('reviewed_by_user_id')
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamp('mswd_verified_at')->nullable()->after('reviewed_at');
            $table->text('mswd_verification_notes')->nullable()->after('remarks');
            $table->string('mswd_verification_fingerprint', 64)->nullable();
            $table->timestamp('document_requirements_captured_at')->nullable();

            $table->index(['municipal_id', 'mswd_verification_status', 'status'], 'ac_request_mswd_status_idx');
        });

        // Existing open cases require a real MSWD review before their next
        // release. Terminal historical records deliberately remain NULL: this
        // migration cannot reconstruct a verification that happened on paper.
        DB::table('ac_assistance_requests')
            ->whereIn('status', ['pending', 'under_review', 'approved'])
            ->update(['mswd_verification_status' => 'pending']);
    }

    public function down(): void
    {
        Schema::table('ac_assistance_requests', function (Blueprint $table): void {
            $table->dropIndex('ac_request_mswd_status_idx');
            $table->dropConstrainedForeignId('mswd_verified_by_user_id');
            $table->dropColumn([
                'mswd_verification_status',
                'mswd_verified_at',
                'mswd_verification_notes',
                'mswd_verification_fingerprint',
                'document_requirements_captured_at',
            ]);
        });
    }
};
