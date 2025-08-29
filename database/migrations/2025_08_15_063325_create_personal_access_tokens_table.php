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
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->text('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->boolean('is_remembered')->default(false); // ✅ no ->after()
            $table->string('device_info')->nullable();        // ✅ no ->after()
            $table->timestamp('last_used_at')->nullable();    // keep only once
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamps();

            // Add index for cleanup operations
            $table->index(['tokenable_type', 'tokenable_id', 'expires_at'], 'pat_tokenable_expires');

        });


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personal_access_tokens');
    }
};
