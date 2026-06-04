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
        Schema::create('user_social_accounts', function (Blueprint $table) {
            $table->ulid('id')->primary();

            // The relationship to your main users table
            $table->foreignUlid('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // The OAuth provider details
            $table->string('provider_name'); // e.g., 'google', 'apple', 'facebook'
            $table->string('provider_id');   // The unique ID from the provider
            $table->string('avatar_url')->nullable(); // Optional: cache their Google profile picture

            $table->timestamps();

            // --- THE ARCHITECTURAL CONSTRAINTS ---

            // 1. Prevent multiple accounts from the same provider on one user
            $table->unique(['user_id', 'provider_name']);

            // 2. Blazing fast lookups during the login handshake
            $table->index(['provider_name', 'provider_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_social_accounts');
    }
};