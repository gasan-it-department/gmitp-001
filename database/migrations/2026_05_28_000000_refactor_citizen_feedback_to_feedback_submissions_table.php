<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::rename('citizen_feedback', 'feedback_submissions');

        Schema::table('feedback_submissions', function (Blueprint $table) {
            $table->dropColumn(['ip_address', 'user_agent', 'feedback_target']);
        });

        Schema::table('feedback_submissions', function (Blueprint $table) {
            $table->renameColumn('sender_name', 'citizen_name');
        });

        Schema::table('feedback_submissions', function (Blueprint $table) {
            $table->string('contact_number')->nullable()->after('citizen_name');
            $table->string('email')->nullable()->after('contact_number');
            $table->string('subject')->after('email');
            $table->softDeletes();
        });

        Schema::dropIfExists('feedback_files');
    }

    public function down(): void
    {
        Schema::table('feedback_submissions', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropColumn(['subject', 'email', 'contact_number']);
        });

        Schema::table('feedback_submissions', function (Blueprint $table) {
            $table->renameColumn('citizen_name', 'sender_name');
        });

        Schema::table('feedback_submissions', function (Blueprint $table) {
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->string('feedback_target')->nullable();
        });

        Schema::rename('feedback_submissions', 'citizen_feedback');
    }
};
