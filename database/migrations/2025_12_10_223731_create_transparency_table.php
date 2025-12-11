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

            $table->foreignUlid('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('reference_number')->unique()->nullable();


            $table->string('title');

            $table->decimal('approved_budget', 15, 2)->nullable();

            $table->decimal('contract_amount', 15, 2)->nullable();

            $table->string('category')->nullable();

            $table->string('status')->nullable();

            $table->dateTime('pre_bid_date')->nullable();

            $table->dateTime('closing_date')->nullable();

            //winner info
            $table->string('winning_bidder')->nullable();

            $table->dateTime('award_date')->nullable();

            $table->timestamps();

        });

        Schema::create('procurement_files', function (Blueprint $table) {

            $table->ulid('id')->primary();

            $table->foreignUlid('procurement_id')
                ->constrained('procurements')
                ->cascadeOnDelete();

            $table->string('public_id');

            $table->string('type')->default('DOCUMENT');

            $table->string('file_name'); // e.g., "Invitation_to_Bid.pdf" (Original name)

            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('procurement_files');

        Schema::dropIfExists('procurements');
    }
};
