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
        Schema::create('ac_assistance_requests', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->foreignUlid('municipal_id')
                ->constrained('municipalities')
                ->restrictOnDelete();

            $table->foreignUlid('beneficiary_id')
                ->constrained('ac_beneficiaries')
                ->onDelete('cascade');

            $table->foreignUlid('household_id')
                ->constrained('ac_households')
                ->restrictOnDelete();

            $table->foreignUlid('encoded_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignUlid('assistance_type_id')
                ->constrained('ac_assistance_types')
                ->restrictOnDelete();

            $table->foreignUlid('on_behalf_household_member_id')
                ->nullable()
                ->constrained('ac_household_members')
                ->nullOnDelete();

            $table->foreignUlid('reviewed_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignUlid('approved_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignUlid('rejected_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignUlid('cancelled_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignUlid('released_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('release_reference_number', 60)
                ->nullable();

            $table->decimal('amount_approved', 10, 2)->nullable();
            $table->string('transaction_number')->unique();
            $table->string('status')->default('pending');
            $table->text('description')->nullable();
            $table->text('remarks')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamp('approved_at')->nullable();
            $table->timestamp('released_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('rejected_at')->nullable();

            $table->timestamp('privacy_consented_at');
            $table->string('privacy_notice_version');

            $table->softDeletes();
            $table->timestamps();

            $table->unique(
                ['municipal_id', 'release_reference_number'],
                'ac_assistance_requests_release_ref_unique',
            );

            $table->index(['beneficiary_id', 'assistance_type_id', 'status', 'approved_at']);
            $table->index(['household_id', 'assistance_type_id', 'status', 'approved_at']);
            $table->index(['municipal_id', 'status', 'created_at']);
            $table->index(['on_behalf_household_member_id', 'assistance_type_id', 'status', 'approved_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ac_assistance_requests');
    }
};
