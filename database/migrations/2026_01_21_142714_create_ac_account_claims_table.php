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
        Schema::create('ac_account_claims', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->foreignUlid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUlid('beneficiary_id')->constrained('ac_beneficiaries')->cascadeOnDelete();

            // STRICT: ID Photo is absolutely required for DPA compliance. No nullable().
            $table->string('id_photo_path');
            $table->string('selfie_photo_path')->nullable();

            $table->string('status')->default('pending');

            // Audit Trail
            $table->foreignUlid('reviewed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('remarks')->nullable();

            $table->timestamps();

            // 1. Our Spam Protection (Write Optimization)
            // Prevents a user from having multiple pending claims for the same record
            $table->unique(['user_id', 'beneficiary_id', 'status']);

            // 2. Claude's Dashboard Speed (Read Optimization)
            // Makes the Social Worker's "Pending Claims" table load instantly
            $table->index(['status', 'created_at']);

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ac_account_claims');
    }
};
