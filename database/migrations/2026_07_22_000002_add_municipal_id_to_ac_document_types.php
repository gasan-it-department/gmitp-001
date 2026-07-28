<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ac_document_types', function (Blueprint $table) {
            $table->foreignUlid('municipal_id')
                ->nullable()
                ->after('id')
                ->constrained('municipalities')
                ->cascadeOnDelete();

            $table->index('municipal_id');
        });
    }

    public function down(): void
    {
        Schema::table('ac_document_types', function (Blueprint $table) {
            $table->dropForeign(['municipal_id']);
            $table->dropIndex(['municipal_id']);
            $table->dropColumn('municipal_id');
        });
    }
};
