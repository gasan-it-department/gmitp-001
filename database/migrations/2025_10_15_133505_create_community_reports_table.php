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
        Schema::create('community_reports', function (Blueprint $table) {

            $table->ulid('id')->primary();

            $table->string('type')->nullable();

            $table->text('description');

            $table->string('latitude');

            $table->foreignUlid('user_id')
                ->nullable();

            $table->string('longitude');

            $table->string('status')->nullable();

            $table->string('sender_name')->nullable();

            $table->string('contact')->nullable();

            $table->string('location');

            $table->foreignUlid('municipal_id')
                ->constrained('municipalities')
                ->restrictOnDelete();

            $table->timestamp('resolved_at')->nullable();

            $table->timestamps();

        });

        Schema::create('report_files', function (Blueprint $table) {

            $table->ulid('id')->primary();

            $table->string('file_type')->nullable();

            $table->string('original_name')->nullable();

            $table->string('file_url')->nullable();

            $table->string('file_path')->nullable();

            $table->string('mime_type')->nullable();

            $table->unsignedBigInteger('file_size');

            $table->timestamps();

            $table->foreignUlid('report_id')
                ->references('id')
                ->on('community_reports')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {

        Schema::dropIfExists('report_files');

        Schema::dropIfExists('community_reports');

    }
};
