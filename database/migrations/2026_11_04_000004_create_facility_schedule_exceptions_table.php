<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
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
    }

    public function down(): void
    {
        Schema::dropIfExists('facility_schedule_exceptions');
    }
};

