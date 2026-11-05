<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
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
    }

    public function down(): void
    {
        Schema::dropIfExists('facility_weekly_periods');
    }
};

