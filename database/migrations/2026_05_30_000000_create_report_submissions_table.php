<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('report_submissions', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->ulid('municipal_id')->index();
            $table->ulid('user_id')->nullable()->index();

            $table->string('category', 32);
            $table->string('status', 32)->default('pending')->index();

            $table->string('location_text');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->text('description');
            $table->boolean('is_anonymous')->default(false);

            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamp('in_progress_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();

            $table->ulid('acknowledged_by')->nullable()->index();
            $table->ulid('in_progress_by')->nullable()->index();
            $table->ulid('resolved_by')->nullable()->index();
            $table->ulid('rejected_by')->nullable()->index();

            $table->string('assigned_to')->nullable();
            $table->text('acknowledgement_note')->nullable();
            $table->text('resolution_note')->nullable();
            $table->string('rejection_reason', 500)->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('report_submissions');
    }
};
