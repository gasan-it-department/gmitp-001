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
        Schema::create('citizen_feedback', function (Blueprint $table) {
            $table->ulid('id')->primary();
            //information
            $table->boolean('is_anonymous')->default(false);
            $table->text('message');
            $table->foreignUlid('department_id')->nullable();
            $table->string('sender_name');
            $table->string('attachment_path')->nullable();
            $table->string('employee_name');
            $table->string('subject_type')->nullable();
            $table->unsignedBigInteger('rating')->nullable();
            $table->string('name')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();

            $table->timestamps();
        });

        Schema::create('feedback_responses', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->text('message')->nullable();
            $table->foreignUlid('feedback_id')->constrained('citizen_feedback')->cascadeOnDelete();
            $table->foreignUlid('responder_id')->constrained('users')->cascadeOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('citizen_feedback');
    }
};
