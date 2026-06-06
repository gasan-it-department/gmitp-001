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
        Schema::create('feedback_submissions', function (Blueprint $table) {
            $table->ulid('id')->primary();

            // Core Relationships & Tenant Scope
            $table->ulid('municipal_id')->index();
            $table->ulid('department_id')->nullable();
            $table->ulid('user_id')->nullable();

            // Encrypted PII & Contact Info
            $table->string('citizen_name')->nullable();
            $table->text('contact_number')->nullable();
            $table->text('email')->nullable();

            // Feedback Details
            $table->string('employee_name')->nullable();
            $table->string('subject');
            $table->text('message');
            $table->unsignedTinyInteger('rating')->nullable();
            $table->boolean('is_anonymous')->default(false);

            // Timestamps & Soft Deletes
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {

        Schema::dropIfExists('feedback_submissions');

    }
};
