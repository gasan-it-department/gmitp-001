<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gd_bulk_dispatch_recipient_lines', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->ulid('municipal_id');
            $table->ulid('bulk_dispatch_id');
            $table->ulid('recipient_id');
            $table->ulid('bulk_dispatch_line_id');
            $table->ulid('item_id');
            $table->string('item_name_snapshot');
            $table->string('item_code_snapshot', 50);
            $table->string('base_unit', 16);
            $table->decimal('quantity', 15, 3);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('revision');
            $table->timestamps();
            $table->index(['bulk_dispatch_id', 'municipal_id', 'is_active'], 'gd_bulk_recipient_line_totals_idx');
            $table->foreign(['recipient_id', 'bulk_dispatch_id', 'municipal_id'], 'gd_bulk_recipient_line_header_fk')->references(['id', 'bulk_dispatch_id', 'municipal_id'])->on('gd_bulk_dispatch_recipients')->restrictOnDelete();
            $table->foreign(['bulk_dispatch_line_id', 'bulk_dispatch_id', 'municipal_id'], 'gd_bulk_recipient_line_issued_fk')->references(['id', 'bulk_dispatch_id', 'municipal_id'])->on('gd_bulk_dispatch_lines')->restrictOnDelete();
            $table->foreign(['item_id', 'municipal_id'], 'gd_bulk_recipient_line_item_fk')->references(['id', 'municipal_id'])->on('gd_items')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gd_bulk_dispatch_recipient_lines');
    }
};
