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
        Schema::create('beneficiary_flags', function (Blueprint $table) {
            $table->ulid('id')->primary(); // Consistent with your other tables using ULID

            $table->foreignUlid('beneficiary_id')
                ->constrained('ac_beneficiaries')
                ->onDelete('cascade');

            $table->foreignUlid('user_id')
                ->nullable() // Nullable in case the user is deleted or system-generated
                ->constrained('users')
                ->nullOnDelete();

            $table->string('reason');

            // Severity level: 'warning' (proceed with caution) or 'blacklist' (do not serve)
            $table->string('severity')->default('warning');

            // Optional: Notes for internal details
            $table->text('notes')->nullable();

            // When the flag effectively expires (optional, nullable means permanent)
            $table->timestamp('expires_at')->nullable();

            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('beneficiary_flags');
    }
};
