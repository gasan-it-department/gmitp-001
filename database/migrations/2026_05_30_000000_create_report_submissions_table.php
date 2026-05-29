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

            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('in_progress_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('report_submissions');
    }
};
