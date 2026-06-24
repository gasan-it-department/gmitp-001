<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
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
    }
};
