<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cemetery_decedent_documents', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('municipal_id')->constrained('municipalities')->restrictOnDelete();
            $table->foreignUlid('decedent_id')->constrained('cemetery_decedents')->cascadeOnDelete();
            $table->ulid('supersedes_id')->nullable();
            $table->string('type')->index();
            $table->string('document_number')->nullable();
            $table->date('issued_at')->nullable();
            $table->text('notes')->nullable();
            $table->string('verification_status')->default('pending')->index();
            $table->timestamp('verified_at')->nullable();
            $table->foreignUlid('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('verification_notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['municipal_id', 'type', 'document_number']);
            $table->index(['municipal_id', 'decedent_id', 'type']);
        });

        Schema::table('cemetery_decedent_documents', function (Blueprint $table) {
            $table->foreign('supersedes_id')->references('id')->on('cemetery_decedent_documents')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cemetery_decedent_documents');
    }
};
