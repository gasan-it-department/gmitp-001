<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cemetery_decedent_corrections', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('municipal_id')->constrained('municipalities')->restrictOnDelete();
            $table->foreignUlid('decedent_id')->constrained('cemetery_decedents')->restrictOnDelete();
            $table->unsignedInteger('base_version');
            $table->json('original_values');
            $table->json('proposed_changes');
            $table->text('reason');
            $table->string('status')->default('pending')->index();
            $table->foreignUlid('requested_by')->constrained('users')->restrictOnDelete();
            $table->foreignUlid('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('review_notes')->nullable();
            $table->timestamp('applied_at')->nullable();
            $table->timestamps();

            $table->index(['municipal_id', 'decedent_id', 'status']);
        });

        Schema::create('cemetery_interment_readiness_overrides', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('municipal_id')->constrained('municipalities')->restrictOnDelete();
            $table->foreignUlid('decedent_id')->constrained('cemetery_decedents')->restrictOnDelete();
            $table->json('missing_requirements');
            $table->text('reason');
            $table->string('evidence_reference');
            $table->timestamp('expires_at')->index();
            $table->timestamp('consumed_at')->nullable();
            $table->foreignUlid('created_by')->constrained('users')->restrictOnDelete();
            $table->foreignUlid('consumed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['municipal_id', 'decedent_id', 'consumed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cemetery_interment_readiness_overrides');
        Schema::dropIfExists('cemetery_decedent_corrections');
    }
};
