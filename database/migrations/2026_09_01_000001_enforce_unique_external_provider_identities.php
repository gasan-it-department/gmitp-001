<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_social_accounts', function (Blueprint $table) {
            $table->dropIndex(['provider_name', 'provider_id']);
            $table->unique(
                ['provider_name', 'provider_id'],
                'user_social_accounts_provider_identity_unique',
            );
        });
    }

    public function down(): void
    {
        Schema::table('user_social_accounts', function (Blueprint $table) {
            $table->dropUnique('user_social_accounts_provider_identity_unique');
            $table->index(['provider_name', 'provider_id']);
        });
    }
};
