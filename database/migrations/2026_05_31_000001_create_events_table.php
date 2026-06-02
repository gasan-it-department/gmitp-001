<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::dropIfExists('events');

        Schema::create('events', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->foreignUlid('municipal_id')
                ->constrained('municipalities')
                ->restrictOnDelete();

            $table->string('title');
            $table->text('description');

            $table->string('type', 32)->default('community')->index();

            $table->timestamp('start_datetime')->index();
            $table->timestamp('end_datetime');

            $table->string('location_name');

            $table->boolean('is_published')->default(false)->index();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['municipal_id', 'start_datetime', 'is_published'], 'events_browse_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
