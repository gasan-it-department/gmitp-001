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
            $table->text('message');
            $table->string('attachment_path')->nullable();
            $table->string('subject');
            $table->string('subject_type')->nullable();
            $table->unsignedBigInteger('rating')->nullable();
            $table->string('name')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->boolean('is_anonymous')->default(false);

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
