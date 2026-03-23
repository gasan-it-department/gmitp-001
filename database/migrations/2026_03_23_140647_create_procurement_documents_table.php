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

            $table->string('public_id');

            $table->string('type')->default('DOCUMENT');

            $table->string('resource_type')->default('image')->after('file_name');

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
