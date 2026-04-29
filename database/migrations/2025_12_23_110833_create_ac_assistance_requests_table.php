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

        Schema::create('ac_assistance_requests', function (Blueprint $table) {

            $table->ulid('id')->primary();

            $table->foreignUlid('municipal_id')
                ->constrained('municipalities')
                ->restrictOnDelete();

            $table->foreignUlid('beneficiary_id')
                ->constrained('ac_beneficiaries')
                ->onDelete('cascade');

            $table->foreignId('household_id')
                ->constrained('ac_households')
                ->restrictOnDelete();

            $table->foreignUlid('encoded_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignUlid('assistance_type_id')
                ->constrained('ac_assistance_types')
                ->restrictOnDelete();

            $table->text('amount')->nullable(); // Text is safer for long encrypted strings

            $table->string('transaction_number')->unique();

            $table->string('status')->default('pending');

            $table->text('description')->nullable();

            //addresses
            $table->string('province')->default('MARINDUQUE');
            $table->string('municipality');
            $table->string('barangay');
            $table->string('street')->nullable();

            $table->softDeletes();

            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ac_assistance_requests');
    }
};
