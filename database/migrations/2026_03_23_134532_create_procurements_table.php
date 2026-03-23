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

            $table->foreignUlid('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignUlid('approved_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignUlid('municipal_id')
                ->nullable()
                ->index() // <--- This creates a standard B-Tree index for fast lookups
                ->constrained('municipalities')
                ->nullOnDelete();

            $table->foreignUlid('funding_source_id')
                ->nullable()
                ->constrained('procurement_funding_sources')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreignUlid('department_id')
                ->nullable()->constrained('departments')
                ->restrictOnDelete();

            $table->string('reference_number')->unique()->nullable();

            $table->string('funding_source')->nullable();

            $table->string('title');

            $table->decimal('approved_budget', 15, 2)->nullable();

            $table->decimal('contract_amount', 15, 2)->nullable();

            $table->string('category')->default('others');

            $table->string('status')->nullable();

            $table->string('winning_bidder')->nullable();

            $table->string('notes')->nullable();

            $table->dateTime('pre_bid_date')->nullable();

            $table->dateTime('closing_date')->nullable();

            $table->dateTime('award_date')->nullable();

            $table->dateTime('published_at')->nullable();

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
