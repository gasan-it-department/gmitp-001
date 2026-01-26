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
        Schema::create('assistance_request_files', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->foreignUlid('assistance_request_id')
                ->constrained('assistance_requests')
                ->cascadeOnDelete();

            $table->string('document_type')->nullable();

            $table->string('public_id')->nullable();

            $table->string('mime_type')->nullable();

            $table->string('resource_type')->default('image');

            $table->string('original_name')->nullable();

            $table->unsignedBigInteger('file_size')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assistance_request_files');
    }
};
