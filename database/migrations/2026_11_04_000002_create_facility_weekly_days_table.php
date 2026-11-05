<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
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
    }

    public function down(): void
    {
        Schema::dropIfExists('facility_weekly_days');
    }
};

