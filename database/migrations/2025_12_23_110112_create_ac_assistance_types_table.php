<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ac_assistance_types', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->foreignUlid('municipal_id')
                ->constrained('municipalities')
                ->cascadeOnDelete();

            $table->string('name');
            $table->string('slug'); // URL-safe key e.g. medical, burial, food, educational, financial
            $table->text('description')->nullable();

            $table->boolean('is_active')->default(true);

            // Cooldown configuration — admin-managed, no developer needed
            $table->unsignedInteger('cooldown_months')->default(0);
            $table->string('cooldown_type')->default('per_request');   // per_request | one_time (burial)
            $table->string('cooldown_scope')->default('per_beneficiary'); // per_beneficiary | per_household (financial per E.O.)

            // Amount bounds for what the mayor / approver can grant.
            // Citizens do NOT request an amount — these only cap approval.
            $table->decimal('min_amount', 10, 2)->default(0);
            $table->decimal('max_amount', 10, 2)->nullable();

            $table->unsignedInteger('sort_order')->default(0);

            $table->softDeletes();
            $table->timestamps();

            // Slug must be unique per municipality (each LGU runs its own programs)
            $table->unique(['municipal_id', 'slug']);
        });
    }

    /*
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ac_assistance_types');
    }
};
