<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gd_distribution_document_checks', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->ulid('municipal_id');
            $table->ulid('distribution_request_id');
            $table->string('document_key');
            $table->string('label');
            $table->text('description')->nullable();
            $table->boolean('is_required');
            $table->boolean('is_active')->default(true);
            $table->string('evidence_mode', 24);
            $table->string('physical_copy_requirement', 40);
            $table->unsignedInteger('sort_order');
            $table->string('status', 24)->default('pending');
            $table->unsignedBigInteger('current_media_id')->nullable();
            $table->unsignedBigInteger('inspected_media_id')->nullable();
            $table->foreign('current_media_id')->references('id')->on('media')->restrictOnDelete();
            $table->foreign('inspected_media_id')->references('id')->on('media')->restrictOnDelete();
            $table->string('presented_copy_type', 40)->nullable();
            $table->text('remarks')->nullable();
            $table->ulid('checked_by_user_id')->nullable();
            $table->timestamp('checked_at')->nullable();
            $table->timestamps();
            $table->unique(['distribution_request_id', 'document_key'], 'gd_document_checks_key_unique');
            $table->foreign(['distribution_request_id', 'municipal_id'], 'gd_document_checks_request_fk')->references(['id', 'municipal_id'])->on('gd_distribution_requests')->restrictOnDelete();
            $table->foreign('checked_by_user_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gd_distribution_document_checks');
    }
};
