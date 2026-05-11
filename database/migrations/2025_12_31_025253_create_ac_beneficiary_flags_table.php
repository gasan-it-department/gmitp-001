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
        Schema::create('ac_beneficiary_flags', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->foreignUlid('beneficiary_id')
                ->constrained('ac_beneficiaries')
                ->cascadeOnDelete();

            // Admin who raised the flag. Nullable if system-generated or if the admin is later removed.
            $table->foreignUlid('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('reason');
            $table->string('severity')->default('warning'); // warning | blacklist
            $table->text('notes')->nullable();

            // NULL = permanent flag. Otherwise the flag stops affecting eligibility after this time.
            $table->timestamp('expires_at')->nullable();

            $table->timestamps();

            // The eligibility checker filters by (beneficiary_id, severity, expires_at) on every request.
            $table->index(['beneficiary_id', 'severity', 'expires_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ac_beneficiary_flags');
    }
};
