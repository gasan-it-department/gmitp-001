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
        Schema::create('cemetery_interments', function (Blueprint $table) {

            $table->ulid('id')->primary();

            // The biological entity being interred
            $table->foreignUlid('decedent_id')
                ->constrained('cemetery_decedents')
                ->restrictOnDelete();

            // The location. Nullable because a decedent might be registered 
            // before a plot is officially assigned (Pending status).
            $table->foreignUlid('plot_id')
                ->nullable()
                ->constrained('cemetery_plots')
                ->restrictOnDelete();

            // Strict database-level enum for status
            $table->enum('status', ['pending', 'interred', 'exhumed', 'transferred'])
                ->default('pending')
                ->index();

            $table->date('interment_date')->nullable();

            $table->timestamps();
            $table->softDeletes();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cemetery_interments');
    }
};
