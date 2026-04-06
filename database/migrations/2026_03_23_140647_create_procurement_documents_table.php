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
        Schema::create('procurement_documents', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->foreignUlid('procurement_id')
                ->constrained('procurements')
                ->cascadeOnDelete();

            $table->foreignUlid('uploaded_by')
                ->nullable() // Must be nullable so nullOnDelete works
                ->constrained('users') // Links to the 'id' column on the 'users' table
                ->nullOnDelete();

            $table->string('file_path');

            $table->string('type')->default('DOCUMENT');

            $table->string('mime_type')->default('application/pdf');

            $table->string('file_name'); // e.g., "Invitation_to_Bid.pdf" (Original name)

            $table->unsignedBigInteger('file_size')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('procurement_documents');
    }
};
