<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cemetery_sites', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('municipal_id')
                ->constrained('municipalities')
                ->restrictOnDelete();

            $table->string('name');
            $table->string('psgc_barangay_code', 20)->nullable()->index();
            $table->string('street_name', 150)->nullable();
            $table->string('status')->default('active');
            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['municipal_id', 'name']);
            $table->unique(
                ['id', 'municipal_id'],
                'cemetery_sites_id_municipal_unique'
            );
            $table->index(['municipal_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cemetery_sites');
    }
};
