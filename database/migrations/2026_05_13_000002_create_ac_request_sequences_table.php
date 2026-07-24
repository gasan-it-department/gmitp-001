<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * One row per year. Each row is the running counter used to generate the
 * citizen-facing transaction_number (REQ-YYYY-XXXX).
 *
 * The previous implementation used COUNT(*) + 1 in ac_assistance_requests,
 * which races under concurrent submission and produces duplicate transaction
 * numbers (the unique index then throws). This table is locked with
 * SELECT … FOR UPDATE inside the same DB transaction as the request insert,
 * so the next number is always strictly monotonic.
 *
 * Why a dedicated table (not a DB sequence): keeps the schema portable across
 * MySQL / PostgreSQL / SQLite without provider-specific objects, and stays
 * inside Laravel's migration toolchain.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('ac_request_sequences', function (Blueprint $table) {
            $table->id();
            $table->unsignedSmallInteger('year')->unique();
            $table->unsignedInteger('last_seq')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ac_request_sequences');
    }
};
