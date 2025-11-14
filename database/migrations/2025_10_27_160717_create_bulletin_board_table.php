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
                ->restrictOnDelete();

            $table->foreignUlid('municipal_id')
                ->constrained('municipalities')
                ->restrictOnDelete();

            $table->boolean('is_published')->default(false);
            $table->softDeletes();
            $table->timestamps();

            $table->index('municipal_id');
        });

        Schema::create('events', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->string('title');
            $table->text('description');
            $table->timestamp('event_date');

            $table->foreignUlid('user_id')
                ->constrained('users')
                ->restrictOnDelete();

            $table->foreignUlid('municipal_id')
                ->constrained('municipalities')
                ->restrictOnDelete();

            $table->boolean('is_published')->default(false);
            $table->softDeletes();

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
