<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Adds the rejecter FK so we can identify WHO denied the request — mirrors
     * the existing approved_by_user_id / reviewed_by_user_id columns. Without
     * this, the only trail of a rejection would be the activity log; for COA
     * we want it queryable on the row itself.
     */
    public function up(): void
    {
        Schema::table('ac_assistance_requests', function (Blueprint $table) {
            $table->foreignUlid('rejected_by_user_id')
                ->nullable()
                ->after('approved_by_user_id')
                ->constrained('users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('ac_assistance_requests', function (Blueprint $table) {
            $table->dropConstrainedForeignId('rejected_by_user_id');
        });
    }
};
