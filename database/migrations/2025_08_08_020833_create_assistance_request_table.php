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
        //change this to uuid
        Schema::create('assistance_clients', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique(); // Separate UUID field
            $table->timestamps();
            $table->string('name');
            $table->integer('age');
            $table->string('contact_number');
            $table->text('address');
        });

        Schema::create('assistance_requests', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->timestamps();
            $table->enum('assistance_type', ['financial', 'food', 'burial', 'medical', 'transportation']);
            $table->unsignedBigInteger('client_id');
            $table->enum('status', ['pending', 'approved', 'denied', 'completed'])->default('pending');
            $table->text('description')->nullable();

            $table->foreign('client_id')->references('id')->on('assistance_clients')->onDelete('cascade');
        });

        Schema::create('assistance_documents', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->timestamps();
            $table->string('document_type');
            $table->string('file_name');
            $table->string('file_path');
            $table->string('file_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assistance_requests');
        Schema::dropIfExists('assistance_clients');
    }
};
