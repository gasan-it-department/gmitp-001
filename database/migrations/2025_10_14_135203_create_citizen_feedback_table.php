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
            $table->boolean('is_anonymous')->nullable();
            $table->foreignUlid('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->text('message');
            $table->foreignUlid('department_id')->nullable();
            $table->string('sender_name')->nullable();
            $table->string('employee_name')->nullable();
            $table->string('feedback_target')->nullable();
            $table->unsignedBigInteger('rating')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();

            $table->timestamps();
        });

        Schema::create('feedback_files', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('file_type')->nullable();
            $table->string('original_name')->nullable();
            $table->string('file_url')->nullable();
            $table->string('file_path')->nullable();
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('file_size');
            $table->timestamps();

            $table->foreignUlid('feedback_id')
                ->references('id')
                ->on('citizen_feedback')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feedback_files');
        Schema::dropIfExists('citizen_feedback');

    }
};
