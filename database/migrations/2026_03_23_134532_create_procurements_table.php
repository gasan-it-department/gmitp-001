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
        Schema::create('procurements', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->foreignUlid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUlid('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUlid('municipal_id')
                ->constrained('municipalities')
                ->restrictOnDelete();
            // Kept only the ID, removed the duplicate string column
            $table->foreignUlid('funding_source_id')->nullable()->constrained('procurement_funding_sources')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignUlid('department_id')->nullable()->constrained('departments')->restrictOnDelete();

            // PhilGEPS Reference Number
            $table->string('reference_number')->unique()->nullable();
            $table->string('title');

            // Renamed to match RA 9184 terminology
            $table->decimal('abc_amount', 15, 2)->nullable();
            $table->decimal('contract_amount', 15, 2)->nullable();

            $table->string('category')->default('GOODS'); // Use Enum values
            $table->string('status')->default('draft');   // Default to draft, not null

            $table->string('winning_bidder_name')->nullable();
            $table->text('notes')->nullable(); // Changed to text in case of long BAC notes
            $table->text('description')->nullable();

            $table->dateTime('pre_bid_date')->nullable();
            $table->dateTime('closing_date')->nullable();
            $table->dateTime('awarded_date')->nullable();

            // The timestamp that controls public visibility
            $table->dateTime('published_at')->nullable();

            $table->date('failed_date')->nullable();
            $table->text('failure_reason')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['municipal_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('procurements');
    }
};
