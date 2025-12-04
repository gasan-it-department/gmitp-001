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
        Schema::create('assistance_beneficiaries', function (Blueprint $table) {

            $table->ulid('id')->primary();

            // $table->foreignUlid('municipality_id')
            //     ->constrained('municipalities')
            //     ->restrictOnDelete();

            $table->string('first_name');

            $table->string('middle_name')->nullable();

            $table->string('last_name');

            $table->string('suffix')->nullable();

            $table->date('birth_date');

            $table->string('contact_number');

            $table->string('email')->nullable();

            $table->string('province');

            $table->string('municipality');

            $table->string('barangay');

            $table->boolean('is_active')->default(false);

            $table->timestamp('verified_at')->nullable();

            $table->timestamps();

        });

        Schema::create('assistance_requests', function (Blueprint $table) {

            $table->ulid('id')->primary();

            $table->foreignUlid('beneficiary_id')
                ->constrained('assistance_beneficiaries')
                ->onDelete('cascade');

            $table->foreignUlid('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignUlid('municipal_id')
                ->constrained('municipalities')
                ->restrictOnDelete();

            $table->decimal('amount', 12, 2)->default(0);

            $table->string('transaction_number')->unique();

            $table->string('assistance_type');

            $table->string('status')->default('pending');

            $table->text('description')->nullable();

            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assistance_requests');
        Schema::dropIfExists('assistance_beneficiaries');

    }
};
