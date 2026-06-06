<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('support_ticket_replies', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->ulid('ticket_id')->index();
            $table->ulid('user_id')->nullable()->index();

            $table->boolean('is_staff')->default(false);
            $table->text('body');

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('ticket_id')
                ->references('id')
                ->on('support_tickets')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_ticket_replies');
    }
};
