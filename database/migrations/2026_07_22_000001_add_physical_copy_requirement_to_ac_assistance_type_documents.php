<?php

use App\Core\ActionCenter\Enums\PhysicalCopyRequirement;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ac_assistance_type_documents', function (Blueprint $table) {
            $table->string('physical_copy_requirement', 50)
                ->default(PhysicalCopyRequirement::Unspecified->value);
        });
    }

    public function down(): void
    {
        Schema::table('ac_assistance_type_documents', function (Blueprint $table) {
            $table->dropColumn('physical_copy_requirement');
        });
    }
};
