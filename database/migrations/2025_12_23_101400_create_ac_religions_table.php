<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * Admin-managed dropdown source for the resident profile form.
     * Kept as a table (not an enum) so MSWD can add new entries —
     * "Iglesia ni Cristo", "Born Again", "Aglipayan", "Prefer not to say",
     * etc. — without needing a developer to ship a migration.
     */
    public function up(): void
    {
        Schema::create('ac_religions', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->string('name')->unique();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);

            $table->timestamps();

            // The dropdown query: WHERE is_active = 1 ORDER BY sort_order, name
            $table->index(['is_active', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ac_religions');
    }
};
