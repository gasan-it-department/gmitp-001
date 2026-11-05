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

        Schema::create('facility_weekly_days', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('municipal_id');
            $table->ulid('facility_id');
            $table->unsignedTinyInteger('day_of_week'); // ISO: Monday 1, Sunday 7.
            $table->boolean('is_closed');
            $table->timestamps();
            $table->unique(['facility_id', 'day_of_week'], 'facility_weekday_unique');
            $table->unique(['municipal_id', 'id'], 'facility_days_tenant_id_unique');
            $table->foreign(['municipal_id', 'facility_id'], 'facility_days_tenant_fk')
                ->references(['municipal_id', 'id'])->on('facilities')->cascadeOnDelete();
        });

        Schema::create('facility_weekly_periods', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('municipal_id');
            $table->ulid('weekly_day_id');
            $table->unsignedSmallInteger('opening_minute');
            $table->unsignedSmallInteger('closing_minute'); // 1440 means end of day.
            $table->timestamps();
            $table->unique(['weekly_day_id', 'opening_minute'], 'facility_weekly_period_unique');
            $table->foreign(['municipal_id', 'weekly_day_id'], 'facility_periods_tenant_fk')
                ->references(['municipal_id', 'id'])->on('facility_weekly_days')->cascadeOnDelete();
        });

        Schema::create('facility_schedule_exceptions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('municipal_id');
            $table->ulid('facility_id');
            $table->date('exception_date'); // A calendar date in Asia/Manila.
            $table->boolean('is_closed');
            $table->string('notice_type', 32);
            $table->text('public_notice');
            $table->timestamps();
            $table->unique(['facility_id', 'exception_date'], 'facility_exception_date_unique');
            $table->unique(['municipal_id', 'id'], 'facility_exceptions_tenant_unique');
            $table->foreign(['municipal_id', 'facility_id'], 'facility_exceptions_tenant_fk')
                ->references(['municipal_id', 'id'])->on('facilities')->cascadeOnDelete();
        });

        Schema::create('facility_exception_periods', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('municipal_id');
            $table->ulid('exception_id');
            $table->unsignedSmallInteger('opening_minute');
            $table->unsignedSmallInteger('closing_minute');
            $table->timestamps();
            $table->unique(['exception_id', 'opening_minute'], 'facility_exception_period_unique');
            $table->foreign(['municipal_id', 'exception_id'], 'facility_exception_periods_tenant_fk')
                ->references(['municipal_id', 'id'])->on('facility_schedule_exceptions')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facility_exception_periods');
        Schema::dropIfExists('facility_schedule_exceptions');
        Schema::dropIfExists('facility_weekly_periods');
        Schema::dropIfExists('facility_weekly_days');
        Schema::dropIfExists('facilities');
    }
};
