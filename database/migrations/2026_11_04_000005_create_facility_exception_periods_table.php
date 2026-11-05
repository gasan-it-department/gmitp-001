<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
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
    }
};

