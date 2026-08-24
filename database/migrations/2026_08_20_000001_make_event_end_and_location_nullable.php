<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->timestamp('end_datetime')->nullable()->change();
            $table->string('location_name')->nullable()->change();
        });
    }

    public function down(): void
    {
        DB::table('events')
            ->whereNull('end_datetime')
            ->update(['end_datetime' => DB::raw('start_datetime')]);

        DB::table('events')
            ->whereNull('location_name')
            ->update(['location_name' => '']);

        Schema::table('events', function (Blueprint $table) {
            $table->timestamp('end_datetime')->nullable(false)->change();
            $table->string('location_name')->nullable(false)->change();
        });
    }
};
