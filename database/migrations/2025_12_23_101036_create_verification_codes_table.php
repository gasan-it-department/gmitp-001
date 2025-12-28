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
        Schema::create('verification_codes', function (Blueprint $table) {

            $table->ulid('id')->primary();

            $table->string('code');

            // Stores the Email ("john@example.com") OR Phone ("0917...")
            $table->string('receiver')->index();

            $table->string('purpose', 20)->nullable();

            // Defines the type: 'sms' or 'email'
            $table->string('channel');

            $table->timestamp('expires_at');

            $table->timestamps();

            // Composite index for faster lookups
            $table->index(['receiver', 'channel']);

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('verification_codes');
    }
};
