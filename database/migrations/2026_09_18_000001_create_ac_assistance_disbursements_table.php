<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ac_assistance_disbursements', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->foreignUlid('municipal_id')->constrained('municipalities')->restrictOnDelete();
            $table->foreignUlid('assistance_request_id')->constrained('ac_assistance_requests')->cascadeOnDelete();
            $table->unsignedSmallInteger('attempt_number');

            $table->string('method', 24);
            $table->string('status', 24)->default('preparing');
            $table->decimal('amount', 10, 2);
            $table->string('payee_name', 255);
            $table->string('instrument_reference_number', 100);
            $table->date('instrument_date');

            $table->string('claim_location_key', 80);
            $table->string('claim_location_label', 255);
            $table->text('claim_instructions')->nullable();
            $table->string('source_fingerprint', 64);
            $table->text('preparation_notes')->nullable();

            $table->foreignUlid('prepared_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('prepared_at');
            $table->foreignUlid('ready_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('ready_at')->nullable();

            $table->string('notification_status', 24)->nullable();
            $table->string('notification_phone', 40)->nullable();
            $table->text('notification_message')->nullable();
            $table->unsignedSmallInteger('notification_attempts')->default(0);
            $table->timestamp('notification_attempted_at')->nullable();
            $table->timestamp('notification_sent_at')->nullable();
            $table->text('notification_failure')->nullable();

            $table->foreignUlid('released_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('released_at')->nullable();
            $table->string('release_reference_number', 60)->nullable();
            $table->string('receiver_type', 24)->nullable();
            $table->string('receiver_name', 255)->nullable();
            $table->string('receiver_relationship', 100)->nullable();
            $table->string('receiver_id_type', 100)->nullable();
            $table->string('receiver_id_last_four', 4)->nullable();
            $table->timestamp('identity_checked_at')->nullable();
            $table->timestamp('acknowledgement_signed_at')->nullable();
            $table->text('release_notes')->nullable();

            $table->foreignUlid('voided_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('voided_at')->nullable();
            $table->text('void_reason')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['assistance_request_id', 'attempt_number'], 'ac_disbursement_request_attempt_unique');
            $table->index(['municipal_id', 'status', 'created_at'], 'ac_disbursement_municipal_status_idx');
            $table->index(['assistance_request_id', 'status'], 'ac_disbursement_request_status_idx');
        });

        if (in_array(DB::getDriverName(), ['pgsql', 'sqlite'], true)) {
            DB::statement(
                "CREATE UNIQUE INDEX ac_disbursement_instrument_unique
                 ON ac_assistance_disbursements (municipal_id, method, instrument_reference_number)
                 WHERE status <> 'voided'",
            );
            DB::statement(
                "CREATE UNIQUE INDEX ac_disbursement_one_active_per_request
                 ON ac_assistance_disbursements (assistance_request_id)
                 WHERE status IN ('preparing', 'ready')",
            );
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('ac_assistance_disbursements');
    }
};
