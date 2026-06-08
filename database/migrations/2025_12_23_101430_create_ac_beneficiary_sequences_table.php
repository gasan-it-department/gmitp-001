<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * One row per municipality. Each row is the running counter used to generate the
 * human-friendly beneficiary_number (e.g. GAS-000123).
 *
 * Mirrors ac_request_sequences exactly, but keyed by municipal_id instead of
 * year: a transaction number resets annually, whereas a beneficiary is a
 * lifelong identity scoped to the LGU that registered them. The row is locked
 * with SELECT … FOR UPDATE inside the same DB transaction as the beneficiary
 * insert, so the next number is always strictly monotonic and never collides
 * under concurrent registration (the COUNT(*)+1 approach races).
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('ac_beneficiary_sequences', function (Blueprint $table) {
            $table->ulid('id')->primary();
            // One counter per tenant. Unique so the lock target is unambiguous.
            $table->foreignUlid('municipal_id')
                ->unique()
                ->constrained('municipalities')
                ->cascadeOnDelete();

            $table->unsignedInteger('last_seq')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ac_beneficiary_sequences');
    }
};
