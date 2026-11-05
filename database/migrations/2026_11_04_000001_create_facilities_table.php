<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('facilities', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('municipal_id')->constrained('municipalities')->restrictOnDelete();
            $table->string('name');
            $table->string('type', 32);
            $table->text('description')->nullable();
            $table->string('location_name')->nullable();
            $table->text('address')->nullable();
            $table->string('contact_name')->nullable();
            $table->string('contact_phone', 50)->nullable();
            $table->string('contact_email')->nullable();
            $table->boolean('is_published')->default(false);
            $table->string('operating_status', 32)->default('following_schedule');
            $table->text('operating_notice')->nullable();
            $table->timestamp('expected_reopens_at')->nullable();
            $table->unsignedInteger('revision')->default(0);
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['municipal_id', 'id'], 'facilities_tenant_id_unique');
            $table->index(['municipal_id', 'is_published', 'type'], 'facilities_public_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facilities');
    }
};

