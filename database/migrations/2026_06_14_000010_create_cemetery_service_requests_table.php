<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cemetery_service_requests', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->foreignUlid('municipal_id')
                ->constrained('municipalities')
                ->restrictOnDelete();

            $table->string('requestable_type');
            $table->ulid('requestable_id');
            $table->enum('request_type', [
                'interment',
                'plot_move',
                'exhumation',
                'transfer_out',
                'void_interment',
                'reverse_move',
            ])->index();

            $table->string('requesting_party_name');
            $table->string('requesting_party_contact')->nullable();
            $table->string('requesting_party_address')->nullable();
            $table->string('requesting_party_relationship');
            $table->boolean('requester_is_leaseholder')->default(false);

            $table->string('leaseholder_name_snapshot')->nullable();
            $table->string('leaseholder_contact_snapshot')->nullable();
            $table->boolean('leaseholder_consent_confirmed')->default(false);
            $table->enum('leaseholder_consent_method', [
                'leaseholder_present',
                'verbal_authorization',
                'written_authorization',
                'family_attestation',
                'not_applicable',
            ])->default('not_applicable');
            $table->string('leaseholder_consent_reference')->nullable();
            $table->text('notes')->nullable();

            $table->foreignUlid('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['municipal_id', 'request_type'], 'cem_srv_req_type_idx');
            $table->index(['municipal_id', 'requestable_type', 'requestable_id'], 'cem_srv_req_requestable_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cemetery_service_requests');
    }
};
