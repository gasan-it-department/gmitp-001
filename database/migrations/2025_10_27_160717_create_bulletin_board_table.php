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
        Schema::create('announcements', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->string('title');
            $table->text('message');
            $table->foreignUlid('user_id')
                ->constrained()
                ->onDelete('cascade');

            $table->timestamps();
        });

        Schema::create('events', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->string('title');
            $table->string('message');
            $table->timestamp('event_date_time');
            $table->foreignUlid('user_id')->constrained('users')->cascadeOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('announcements');
        Schema::dropIfExists('events');

    }
};
