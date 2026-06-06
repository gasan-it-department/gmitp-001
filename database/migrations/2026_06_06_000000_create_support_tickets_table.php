<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('support_tickets', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->ulid('municipal_id')->index();
            $table->ulid('user_id')->nullable()->index();

            $table->string('reference_no', 16)->unique();
            $table->string('audience', 16)->index();
            $table->string('category', 32)->index();
            $table->string('priority', 16)->default('normal');
            $table->string('status', 32)->default('open')->index();

            $table->string('subject');
            $table->text('description');

            // Encrypted PII & Contact Info (used for guest citizens / fallback)
            $table->text('contact_name')->nullable();
            $table->text('contact_email')->nullable();
            $table->text('contact_number')->nullable();

            // Technical context (only populated for category=bug)
            $table->string('page_url')->nullable();
            $table->string('app_version', 32)->nullable();
            $table->json('environment')->nullable();

            // Workflow timestamps
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamp('in_progress_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->timestamp('reopened_at')->nullable();

            // Workflow actors
            $table->ulid('acknowledged_by')->nullable()->index();
            $table->ulid('assigned_to')->nullable()->index();
            $table->ulid('resolved_by')->nullable()->index();
            $table->ulid('closed_by')->nullable()->index();

            $table->text('resolution_note')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_tickets');
    }
};
